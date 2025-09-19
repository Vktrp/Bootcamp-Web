import { supabase } from "../../lib/supabase";

/** Variantes provenant de product_variant */
export type Variant = {
  sku: string;
  size?: string;
  stock?: number;
  priceCents?: number;
  image?: string;
  colorway?: string | null;
  gender?: "men" | "women" | "infant";
};

/** Produit groupé par (silhouette, genre) */
export type Product = {
  id: string; // "silhouette::men|women|infant"
  name: string;
  brand?: string;
  image?: string; // image représentative du groupe
  priceCents?: number; // min(retailPrice) du groupe (fallback basic_price)
  groupGender?: "men" | "women" | "infant";
  variants?: Variant[];
};

type ListArgs = { q?: string; categorySlug?: string };

/* ───────── helpers ───────── */
function mapRowToProductBase(
  row: any
): Pick<Product, "name" | "brand" | "image" | "priceCents"> {
  const priceCents =
    row.basic_price != null
      ? Math.round(Number(row.basic_price) * 100)
      : undefined;
  return {
    name: row.silhouette,
    brand: row.brand ?? undefined,
    image: row.image ?? undefined,
    priceCents,
  };
}

function scopeFromSlug(
  slug?: string | null
): "men" | "women" | "infant" | undefined {
  if (!slug) return undefined;
  const s = slug.toLowerCase();
  if (s === "men" || s.includes("homme")) return "men";
  if (s === "women" || s.includes("femme")) return "women";
  if (s === "infant" || s.includes("enfant") || s.includes("kid"))
    return "infant";
  return undefined;
}

function normGender(g: any): "men" | "women" | "infant" | undefined {
  const v = String(g ?? "").toLowerCase();
  if (v === "men") return "men";
  if (v === "women") return "women";
  if (v === "infant") return "infant";
  return undefined;
}

/* ───────── LIST ─────────
   • Retourne une ligne par (silhouette, genre) strict.
   • Prix affiché = min(retailPrice) du groupe (fallback basic_price).
*/
export async function listProducts({
  q,
  categorySlug,
}: ListArgs): Promise<Product[]> {
  // 1) Charger les variantes utiles (on reste côté variantes pour avoir genre + prix)
  const scope = scopeFromSlug(categorySlug);

  let pvQuery = supabase
    .from("product_variant")
    .select("silhouette, gender, retailPrice, image")
    .limit(100000); // confortable (15k lignes chez toi)

  // Pas de heuristique : on filtre directement au niveau SQL si une catégorie est demandée
  if (scope) {
    pvQuery = pvQuery.eq("gender", scope);
  }

  const pv = await pvQuery;
  if (pv.error) {
    console.error("[listProducts] product_variant error:", pv.error);
    return [];
  }

  type GroupAgg = { minPriceCents?: number; sampleImage?: string };
  const groups = new Map<string, GroupAgg>(); // key = `${silhouette}::${g}`

  for (const r of pv.data ?? []) {
    const silhouette: string | undefined = (r as any).silhouette ?? undefined;
    const g = normGender((r as any).gender);
    if (!silhouette || !g) continue; // on exige un genre propre

    const key = `${silhouette}::${g}`;
    const priceRaw = (r as any).retailPrice;
    const priceCents =
      priceRaw != null ? Math.round(Number(priceRaw) * 100) : undefined;

    const prev = groups.get(key) ?? {};
    const nextMin =
      priceCents != null &&
      (prev.minPriceCents == null || priceCents < prev.minPriceCents)
        ? priceCents
        : prev.minPriceCents;
    const nextImg = prev.sampleImage ?? (r as any).image ?? undefined;

    groups.set(key, { minPriceCents: nextMin, sampleImage: nextImg });
  }

  if (groups.size === 0) return [];

  // 2) Charger la table product pour les silhouettes impliquées (+ recherche q)
  const silhouettes = Array.from(
    new Set(Array.from(groups.keys()).map((k) => k.split("::")[0]))
  );

  let prQuery = supabase
    .from("product")
    .select("silhouette,brand,image,basic_price")
    .in("silhouette", silhouettes)
    .limit(10000);

  if (q && q.trim()) {
    const s = q.trim();
    prQuery = prQuery.or(`silhouette.ilike.%${s}%,brand.ilike.%${s}%`) as any;
  }

  const pr = await prQuery;
  if (pr.error) {
    console.error("[listProducts] product error:", pr.error);
    return [];
  }

  const infoBySil = new Map(
    (pr.data ?? []).map((r: any) => [r.silhouette, mapRowToProductBase(r)])
  );

  // 3) Construire les cartes
  const out: Product[] = [];
  for (const [key, agg] of groups.entries()) {
    const [silhouette, g] = key.split("::");
    const base = infoBySil.get(silhouette);
    if (!base) continue;

    out.push({
      id: key,
      name: base.name,
      brand: base.brand,
      image: agg.sampleImage ?? base.image,
      priceCents: agg.minPriceCents ?? base.priceCents,
      groupGender: g as Product["groupGender"],
    });
  }

  // Tri stable
  const order = { men: 0, women: 1, infant: 2 } as Record<string, number>;
  out.sort((a, b) => {
    if (a.name !== b.name) return a.name.localeCompare(b.name);
    return (
      (order[a.groupGender ?? "men"] ?? 9) -
      (order[b.groupGender ?? "men"] ?? 9)
    );
  });

  return out;
}

/* ───────── DETAIL ─────────
   id = "silhouette::genre" → on charge uniquement les variantes de CE genre.
*/
export async function getProduct(id: string): Promise<Product> {
  const [silhouette, scopeRaw] = id.split("::");
  const scope = normGender(scopeRaw) as "men" | "women" | "infant" | undefined;
  const sil = silhouette || id;

  const pr = await supabase
    .from("product")
    .select("silhouette,brand,image,basic_price")
    .eq("silhouette", sil)
    .maybeSingle();

  if (pr.error || !pr.data) {
    console.error("[getProduct] product error:", pr.error);
    throw new Error("Product not found");
  }

  const base = mapRowToProductBase(pr.data);

  const { data: rows, error } = await supabase
    .from("product_variant")
    .select(
      "variant_id, sku, size:size_eu, retailPrice, image, colorway, gender"
    )
    .eq("silhouette", sil)
    .eq("gender", scope ?? "") // genre strict
    .order("size_eu", { ascending: true })
    .limit(2000);

  if (error) console.error("[getProduct] product_variant error:", error);

  // dédoublonnage + mapping
  const seen = new Set<string>();
  const variants: Variant[] = [];
  for (const v of rows ?? []) {
    const sku: string = (v as any).sku ?? (v as any).variant_id ?? "";
    const size: string | undefined = (v as any).size ?? undefined;
    const uniq = `${(v as any).variant_id ?? sku}|${size ?? ""}`;
    if (seen.has(uniq)) continue;
    seen.add(uniq);

    const priceCents =
      (v as any).retailPrice != null
        ? Math.round(Number((v as any).retailPrice) * 100)
        : base.priceCents;

    variants.push({
      sku,
      size,
      priceCents,
      image: (v as any).image ?? undefined,
      stock: undefined,
      colorway: (v as any).colorway ?? null,
      gender: normGender((v as any).gender),
    });
  }

  // tri EU
  variants.sort((a, b) => {
    const pa = parseFloat(String(a.size ?? "").replace(",", "."));
    const pb = parseFloat(String(b.size ?? "").replace(",", "."));
    const aNum = !Number.isNaN(pa);
    const bNum = !Number.isNaN(pb);
    if (aNum && bNum) return pa - pb;
    if (aNum) return -1;
    if (bNum) return 1;
    return String(a.size ?? "").localeCompare(String(b.size ?? ""));
  });

  return {
    id,
    name: base.name,
    brand: base.brand,
    image: base.image,
    priceCents: base.priceCents,
    groupGender: scope,
    variants,
  };
}
