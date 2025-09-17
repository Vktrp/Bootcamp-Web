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

  // Colorways disponibles
  const colorways = useMemo(
    () =>
      Array.from(
        new Set(
          (variants ?? [])
            .map((v) => ((v as any).colorway || "").trim())
            .filter(Boolean)
        )
      ),
    [variants]
  );

  // États UI
  const [color, setColor] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [fav, setFav] = useState(false);
  const [adding, setAdding] = useState(false);

  // Dropdowns compacts
  const [colorOpen, setColorOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);

  // Fermer les panneaux si clic extérieur
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) {
        setColorOpen(false);
      }
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) {
        setSizeOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Tailles dispo pour la couleur sélectionnée (ou toutes si aucune couleur)
  const sizesForColor = useMemo(() => {
    const pool = variants.filter(
      (v) => !color || (v as any).colorway === color
    );
    return new Set(pool.map((v) => String(v.size)));
  }, [variants, color]);

  // Variant sélectionnée
  const selectedVariant = useMemo(() => {
    const exact = variants.find(
      (v) =>
        String(v.size) === String(size) &&
        (!color || (v as any).colorway === color)
    );
    if (exact) return exact;
    const bySize = variants.find((v) => String(v.size) === String(size));
    if (bySize) return bySize;
    return variants[0];
  }, [variants, color, size]);

  const displayPriceCents =
    (selectedVariant as any)?.priceCents ?? p?.priceCents ?? null;

  // Init défauts + favori
  useEffect(() => {
    if (!color && colorways.length) setColor(colorways[0]);
    if (!size && variants.length) {
      const firstFromRange =
        SIZE_RANGES.find((s) => sizesForColor.has(String(s))) ?? "";
      setSize(firstFromRange || String(variants[0].size || ""));
    }
    if (p) {
      const favs = new Set<string>(
        JSON.parse(localStorage.getItem("favs") || "[]")
      );
      setFav(favs.has(p.id));
    }
  }, [variants, colorways, sizesForColor, p, color, size]);

  // Si la taille courante n'existe pas pour la couleur choisie, on ajuste
  useEffect(() => {
    if (size && !sizesForColor.has(String(size))) {
      const first =
        SIZE_RANGES.find((s) => sizesForColor.has(String(s))) ??
        Array.from(sizesForColor)[0] ??
        "";
      setSize(String(first || ""));
    }
  }, [sizesForColor, size]);

  function toggleFavorite() {
    if (!p) return;
    const key = "favs";
    const favs = new Set<string>(JSON.parse(localStorage.getItem(key) || "[]"));
    favs.has(p.id) ? favs.delete(p.id) : favs.add(p.id);
    localStorage.setItem(key, JSON.stringify([...favs]));
    setFav(favs.has(p.id));
  }

  async function addToCart() {
    if (!p || !selectedVariant) return;
    setAdding(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const vColorway: string | null =
        (selectedVariant as any).colorway ?? null;

      if (user) {
        const { error } = await supabase.from("shopping_carts").insert({
          user_id: user.id,
          product_variant_id: (selectedVariant as any).sku, // adapte si nécessaire
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
          colorway?: string | null; // accepte null
        };

        const key = "cart_local";
        const cart = JSON.parse(
          localStorage.getItem(key) || "[]"
        ) as LocalItem[];
        const idv = (selectedVariant as any).sku;

        const idx = cart.findIndex(
          (i) =>
            i.variant_id === idv &&
            i.size === String((selectedVariant as any).size ?? "") &&
            (i.colorway ?? null) === vColorway
        );

        if (idx >= 0) {
          cart[idx].qty += 1;
        } else {
          cart.push({
            variant_id: idv,
            name: p.name,
            size: String((selectedVariant as any).size ?? ""),
            priceCents: displayPriceCents ?? undefined,
            image:
              (selectedVariant as any).image ?? (p.image as string | undefined),
            colorway: vColorway,
            qty: 1,
          });
        }
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
            {(selectedVariant as any)?.image || p.image ? (
              <img
                src={(selectedVariant as any)?.image || (p.image as string)}
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

          {/* Couleur */}
          {colorways.length > 0 && (
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
                    {colorways.map((cw) => {
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

          {/* Taille (liée à la couleur) */}
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
                    const isAvailable = sizesForColor.has(String(s));
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
                        disabled={!isAvailable}
                        onClick={() => {
                          if (!isAvailable) return;
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
            {(selectedVariant as any)?.sku && (
              <>SKU&nbsp;: {(selectedVariant as any).sku}</>
            )}
            {(selectedVariant as any)?.colorway && (
              <>
                {" • "}
                <span>Couleur&nbsp;: {(selectedVariant as any).colorway}</span>
              </>
            )}
          </div>

          <div className="actions mt-4">
            <button
              className="btn"
              onClick={addToCart}
              disabled={!selectedVariant || adding}
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
