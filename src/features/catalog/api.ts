// src/features/catalog/api.ts
import { supabase } from "../../lib/supabase";

/** Variantes provenant de product_variant */
export type Variant = {
  sku: string; // sku ou fallback variant_id
  size?: string; // alias de size_eu
  stock?: number; // (pas en base pour l’instant)
  priceCents?: number; // retailPrice * 100 si présent, sinon prix produit
  image?: string;
  colorway?: string | null;
};

/** Produit provenant de product */
export type Product = {
  id: string; // silhouette
  name: string; // silhouette
  brand?: string;
  image?: string;
  priceCents?: number;
  variants?: Variant[];
};

type ListArgs = { q?: string; categorySlug?: string };

function mapRowToProduct(row: any): Product {
  const priceCents =
    row.basic_price != null
      ? Math.round(Number(row.basic_price) * 100)
      : undefined;
  return {
    id: row.silhouette,
    name: row.silhouette,
    brand: row.brand ?? undefined,
    image: row.image ?? undefined,
    priceCents,
  };
}

function genderPattern(slug?: string): string | null {
  if (!slug) return null;
  const s = slug.toUpperCase();
  if (s === "MEN") return "men%";
  if (s === "WOMEN") return "wom%";
  if (s === "INFANT") return "infant%";
  return null;
}

/** Liste des produits (recherche + filtre catégorie via gender de product_variant) */
export async function listProducts({
  q,
  categorySlug,
}: ListArgs): Promise<Product[]> {
  try {
    // 1) Filtrer par genre → silhouettes autorisées
    let silhouettes: string[] | null = null;
    const pat = genderPattern(categorySlug);
    if (pat) {
      const pv = await supabase
        .from("product_variant")
        .select("silhouette")
        .ilike("gender", pat)
        .limit(2000);

      if (pv.error) {
        console.error("[listProducts] product_variant error:", pv.error);
      } else if (pv.data?.length) {
        silhouettes = Array.from(
          new Set(pv.data.map((r: any) => r.silhouette).filter(Boolean))
        );
      } else {
        return [];
      }
    }

    // 2) Charger les produits
    let qy = supabase
      .from("product")
      .select("silhouette,brand,image,basic_price")
      .limit(500);

    if (q && q.trim()) {
      const s = q.trim();
      qy = qy.or(`silhouette.ilike.%${s}%,brand.ilike.%${s}%`) as any;
    }
    if (silhouettes?.length) {
      qy = qy.in("silhouette", silhouettes) as any;
    }

    const res = await qy;

    if (res.error) {
      console.error("[listProducts] product error:", res.error);
      return [];
    }

    return (res.data ?? []).map(mapRowToProduct);
  } catch (e) {
    console.error("[listProducts] unexpected:", e);
    return [];
  }
}

/** Détail produit + variantes (dédoublonnées et triées par taille EU) */
export async function getProduct(id: string): Promise<Product> {
  // id = silhouette
  const pr = await supabase
    .from("product")
    .select("silhouette,brand,image,basic_price")
    .eq("silhouette", id)
    .maybeSingle();

  if (pr.error || !pr.data) {
    console.error("[getProduct] product error:", pr.error);
    throw new Error("Product not found");
  }

  const prod = mapRowToProduct(pr.data);

  // ============= Variantes =============
  // 1) par silhouette
  const { data: rowsBySilhouette, error: errBySilhouette } = await supabase
    .from("product_variant")
    .select(
      "variant_id, sku, size:size_eu, retailPrice, image, silhouette, name, colorway"
    )
    .eq("silhouette", pr.data.silhouette)
    .order("size_eu", { ascending: true })
    .limit(1000);

  // 2) fallback par name ~ silhouette si rien trouvé
  let rows = rowsBySilhouette ?? [];
  let firstError = errBySilhouette || null;

  if (!rows.length) {
    const { data: rowsByName, error: errByName } = await supabase
      .from("product_variant")
      .select(
        "variant_id, sku, size:size_eu, retailPrice, image, silhouette, name, colorway"
      )
      .ilike("name", `%${pr.data.silhouette}%`)
      .order("size_eu", { ascending: true })
      .limit(1000);

    rows = rowsByName ?? [];
    if (!firstError) firstError = errByName || null;
  }

  if (firstError) {
    console.error("[getProduct] product_variant error:", firstError);
  }

  // 3) dédoublonnage (variant_id/sku + size)
  const seen = new Set<string>();
  const variants: Variant[] = [];

  for (const v of rows) {
    const sku: string = (v as any).sku ?? (v as any).variant_id ?? "";
    const size: string | undefined = (v as any).size ?? undefined;
    const uniq = `${(v as any).variant_id ?? sku}|${size ?? ""}`;
    if (seen.has(uniq)) continue;
    seen.add(uniq);

    const priceCents =
      (v as any).retailPrice != null
        ? Math.round(Number((v as any).retailPrice) * 100)
        : prod.priceCents;

    variants.push({
      sku,
      size,
      priceCents,
      image: (v as any).image ?? undefined,
      stock: undefined,
      colorway: (v as any).colorway ?? null, // ← important pour le sélecteur Couleur
    });
  }

  // 4) tri par taille EU
  const byEuSize = (a: Variant, b: Variant): number => {
    const pa = parseFloat(String(a.size ?? "").replace(",", "."));
    const pb = parseFloat(String(b.size ?? "").replace(",", "."));
    const aNum = !Number.isNaN(pa);
    const bNum = !Number.isNaN(pb);
    if (aNum && bNum) return pa - pb;
    if (aNum) return -1;
    if (bNum) return 1;
    return String(a.size ?? "").localeCompare(String(b.size ?? ""));
  };
  variants.sort(byEuSize);

  prod.variants = variants;
  return prod;
}