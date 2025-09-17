// src/features/catalog/ProductPage.tsx
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { getProduct, type Product, type Variant } from "./api";
import { supabase } from "../../lib/supabase";
import { SIZE_RANGES } from "../../lib/sizes";

function eurosFromCents(cents?: number | null) {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

/** Découpe "Dark Grey/Black/Wolf Grey" -> ["Dark Grey","Black","Wolf Grey"] */
function splitColorway(cw?: string | null): string[] {
  if (!cw) return [];
  return cw
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Teste si un colorway contient un jeton choisi (insensible à la casse) */
function colorwayIncludesToken(
  cw: string | null | undefined,
  token: string
): boolean {
  if (!cw || !token) return false;
  const tokens = splitColorway(cw).map((t) => t.toLowerCase());
  return tokens.includes(token.toLowerCase());
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const productId = id ?? "";

  const {
    data: p,
    isLoading,
    isError,
  } = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
    enabled: Boolean(productId),
  });

  // Variantes dédoublonnées + tri par taille
  const variants: Variant[] = useMemo(() => {
    const seen = new Set<string>();
    const arr: Variant[] = [];
    for (const v of p?.variants ?? []) {
      const k = `${v.sku}|${v.size ?? ""}|${(v as any).colorway ?? ""}`;
      if (seen.has(k)) continue;
      seen.add(k);
      arr.push(v);
    }
    arr.sort((a, b) => {
      const pa = parseFloat(String(a.size ?? "").replace(",", "."));
      const pb = parseFloat(String(b.size ?? "").replace(",", "."));
      const aNum = !Number.isNaN(pa);
      const bNum = !Number.isNaN(pb);
      if (aNum && bNum) return pa - pb;
      if (aNum) return -1;
      if (bNum) return 1;
      return String(a.size ?? "").localeCompare(String(b.size ?? ""));
    });
    return arr;
  }, [p]);

  // Liste des JETONS de couleur (split par "/")
  const colorTokens = useMemo(() => {
    const set = new Set<string>();
    for (const v of variants) {
      for (const token of splitColorway((v as any).colorway)) {
        if (token) set.add(token);
      }
    }
    return Array.from(set);
  }, [variants]);

  // États UI
  const [color, setColor] = useState<string>(""); // ici on stocke le jeton
  const [size, setSize] = useState<string>("");
  const [fav, setFav] = useState(false);
  const [adding, setAdding] = useState(false);

  // Dropdowns compacts
  const [colorOpen, setColorOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);

  // Ferme si clic à l’extérieur
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (colorRef.current && !colorRef.current.contains(e.target as Node))
        setColorOpen(false);
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node))
        setSizeOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Tailles disponibles pour le jeton couleur choisi
  const sizesForColor = useMemo(() => {
    const pool = variants.filter(
      (v) => !color || colorwayIncludesToken((v as any).colorway, color)
    );
    return new Set(pool.map((v) => String(v.size)));
  }, [variants, color]);
  const hasAnySize = sizesForColor.size > 0;

  // Variante exacte (taille + jeton)
  const exactVariant = useMemo(
    () =>
      variants.find(
        (v) =>
          String(v.size) === String(size) &&
          (!color || colorwayIncludesToken((v as any).colorway, color))
      ),
    [variants, size, color]
  );

  // Variante pour l’image (prend une variante qui contient le jeton et a une image)
  const variantForImage = useMemo(
    () =>
      exactVariant ??
      variants.find(
        (v) =>
          color &&
          colorwayIncludesToken((v as any).colorway, color) &&
          (v as any).image
      ) ??
      variants[0],
    [variants, exactVariant, color]
  );

  const displayPriceCents = exactVariant?.priceCents ?? p?.priceCents ?? null;
  const imageForColor =
    (variantForImage as any)?.image || (p?.image as string | undefined);

  // Init défauts + favori
  useEffect(() => {
    if (!color && colorTokens.length) setColor(colorTokens[0]);
    if (!size) {
      const first = (SIZE_RANGES.find((s) => sizesForColor.has(String(s))) ??
        SIZE_RANGES[0] ??
        "") as string;
      setSize(String(first));
    }
    if (p) {
      const favs = new Set<string>(
        JSON.parse(localStorage.getItem("favs") || "[]")
      );
      setFav(favs.has(p.id));
    }
  }, [variants, colorTokens, sizesForColor, p, color, size]);

  // Si la taille courante n’existe plus pour le jeton couleur, on ajuste
  useEffect(() => {
    if (size && hasAnySize && !sizesForColor.has(String(size))) {
      const first =
        SIZE_RANGES.find((s) => sizesForColor.has(String(s))) ??
        Array.from(sizesForColor)[0] ??
        "";
      setSize(String(first || ""));
    }
  }, [sizesForColor, hasAnySize, size]);

  function toggleFavorite() {
    if (!p) return;
    const key = "favs";
    const favs = new Set<string>(JSON.parse(localStorage.getItem(key) || "[]"));
    favs.has(p.id) ? favs.delete(p.id) : favs.add(p.id);
    localStorage.setItem(key, JSON.stringify([...favs]));
    setFav(favs.has(p.id));
  }

  async function addToCart() {
    if (!p || !exactVariant) return;
    setAdding(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const vColorway: string | null = (exactVariant as any).colorway ?? null;

      if (user) {
        const { error } = await supabase.from("shopping_carts").insert({
          user_id: user.id,
          product_variant_id: (exactVariant as any).sku,
          quantity: 1,
        });
        if (error) throw error;
      } else {
        type LocalItem = {
          variant_id: string;
          name: string;
          size?: string;
          priceCents?: number;
          image?: string;
          qty: number;
          colorway?: string | null;
        };
        const key = "cart_local";
        const cart = JSON.parse(
          localStorage.getItem(key) || "[]"
        ) as LocalItem[];
        const idv = (exactVariant as any).sku;

        const idx = cart.findIndex(
          (i) =>
            i.variant_id === idv &&
            i.size === String((exactVariant as any).size ?? "") &&
            (i.colorway ?? null) === vColorway
        );

        if (idx >= 0) cart[idx].qty += 1;
        else
          cart.push({
            variant_id: idv,
            name: p.name,
            size: String((exactVariant as any).size ?? ""),
            priceCents: displayPriceCents ?? undefined,
            image:
              (exactVariant as any).image ?? (p.image as string | undefined),
            colorway: vColorway,
            qty: 1,
          });

        localStorage.setItem(key, JSON.stringify(cart));
      }
    } finally {
      setAdding(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container-page">
        <div className="product-layout">
          <div className="skeleton" style={{ height: 420, borderRadius: 16 }} />
          <div>
            <div
              className="skeleton"
              style={{ height: 32, width: 280, borderRadius: 8 }}
            />
            <div
              className="mt-2 skeleton"
              style={{ height: 20, width: 180, borderRadius: 8 }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !p) {
    return (
      <div className="container-page">
        <p className="text-danger">Produit introuvable.</p>
        <div className="mt-3">
          <Link to="/products" className="btn-outline">
            ← Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page">
      <div className="product-layout">
        {/* Image à gauche */}
        <div className="card product-media">
          <div className="product-media-frame">
            {imageForColor ? (
              <img
                src={imageForColor}
                alt={p.name}
                className="product-media-img"
                loading="eager"
              />
            ) : (
              <div className="empty-box">Pas d’image</div>
            )}
          </div>
        </div>

        {/* Fiche à droite */}
        <div className="product-info">
          <div className="product-title">
            <h1 className="title-xl">{p.name}</h1>
            <div className="text-sm">{p.brand || "—"}</div>
          </div>

          <div className="price-xl mt-3">
            {eurosFromCents(displayPriceCents)}
          </div>

          {/* Couleur (jetons séparés par "/") */}
          {colorTokens.length > 0 && (
            <div className="mt-4">
              <label>Couleur</label>
              <div className="size-select" ref={colorRef}>
                <button
                  type="button"
                  className="size-trigger"
                  onClick={() => setColorOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={colorOpen}
                >
                  <span>{color || "Choisir"}</span>
                  <span className="caret">▾</span>
                </button>
                {colorOpen && (
                  <div className="size-panel" role="listbox">
                    {colorTokens.map((cw) => {
                      const isSelected = color === cw;
                      return (
                        <button
                          key={cw}
                          type="button"
                          className={
                            "size-option" + (isSelected ? " selected" : "")
                          }
                          onClick={() => {
                            setColor(cw);
                            setColorOpen(false);
                          }}
                        >
                          {cw}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Taille (liée au jeton) */}
          <div className="mt-4">
            <label>Taille (EU)</label>
            <div className="size-select" ref={sizeRef}>
              <button
                type="button"
                className="size-trigger"
                onClick={() => setSizeOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={sizeOpen}
              >
                <span>{size || "Choisir"}</span>
                <span className="caret">▾</span>
              </button>
              {sizeOpen && (
                <div className="size-panel" role="listbox">
                  {SIZE_RANGES.map((s) => {
                    const isAvailable = hasAnySize
                      ? sizesForColor.has(String(s))
                      : true;
                    const isSelected = String(size) === String(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        className={
                          "size-option" +
                          (isSelected ? " selected" : "") +
                          (!isAvailable ? " disabled" : "")
                        }
                        disabled={!isAvailable && hasAnySize}
                        onClick={() => {
                          if (!isAvailable && hasAnySize) return;
                          setSize(String(s));
                          setSizeOpen(false);
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="text-sm mt-2">
            {exactVariant?.sku && <>SKU&nbsp;: {exactVariant.sku}</>}
            {(exactVariant as any)?.colorway && (
              <> • Couleur: {(exactVariant as any).colorway}</>
            )}
          </div>

          <div className="actions mt-4">
            <button
              className="btn"
              onClick={addToCart}
              disabled={!exactVariant || adding}
            >
              {adding ? "Ajout..." : "Ajouter au panier"}
            </button>
            <button
              className={`btn-outline fav-btn${fav ? " active" : ""}`}
              onClick={toggleFavorite}
            >
              {fav ? "♥ Favori" : "♡ Favori"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
