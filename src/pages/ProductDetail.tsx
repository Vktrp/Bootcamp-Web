import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase"; // garde ton import existant
import { getProduct, type Product } from "../features/catalog/api";

function eurosFromCents(cents?: number | null) {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export default function ProductDetail() {
  const { slugOrName } = useParams(); // /product/:slugOrName => silhouette
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [fav, setFav] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const id = decodeURIComponent(slugOrName || "");
      try {
        const p = await getProduct(id); // utilise ton API corrigée
        if (!cancelled && p) {
          setProduct(p);
          const first = p.variants?.[0]?.size || "";
          setSelectedSize(String(first));
          const favs = new Set<string>(
            JSON.parse(localStorage.getItem("favs") || "[]")
          );
          setFav(favs.has(p.id));
        }
      } catch {
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slugOrName]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants) return undefined;
    return product.variants.find(
      (v) => String(v.size) === String(selectedSize)
    );
  }, [product, selectedSize]);

  const displayPriceCents = useMemo(() => {
    if (selectedVariant?.priceCents != null) return selectedVariant.priceCents;
    return product?.priceCents ?? null;
  }, [product, selectedVariant]);

  async function toggleFavorite() {
    if (!product) return;
    const key = "favs";
    const favs = new Set<string>(JSON.parse(localStorage.getItem(key) || "[]"));
    favs.has(product.id) ? favs.delete(product.id) : favs.add(product.id);
    localStorage.setItem(key, JSON.stringify([...favs]));
    setFav(favs.has(product.id));
  }

  async function addToCart() {
    if (!product || !selectedVariant) return;
    setAdding(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // shopping_carts(user_id, product_variant_id, quantity)
        const { error } = await supabase.from("shopping_carts").insert({
          user_id: user.id,
          product_variant_id: selectedVariant.sku, // sku ou variant_id, selon tes données
          quantity: 1,
        });
        if (error) throw error;
      } else {
        // Fallback local
        type LocalItem = {
          variant_id: string;
          name: string;
          size?: string;
          priceCents?: number;
          image?: string;
          qty: number;
        };
        const key = "cart_local";
        const cart = JSON.parse(
          localStorage.getItem(key) || "[]"
        ) as LocalItem[];
        const id = selectedVariant.sku;
        const idx = cart.findIndex((i) => i.variant_id === id);
        if (idx >= 0) cart[idx].qty += 1;
        else
          cart.push({
            variant_id: id,
            name: product.name,
            size: selectedVariant.size,
            priceCents: displayPriceCents ?? undefined,
            image: selectedVariant.image ?? product.image,
            qty: 1,
          });
        localStorage.setItem(key, JSON.stringify(cart));
      }
      // ici tu peux afficher un toast si tu en as un
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-slate-200">
        <div className="animate-pulse h-8 w-72 rounded bg-slate-700 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-80 rounded-xl bg-slate-800" />
          <div className="space-y-4">
            <div className="h-6 w-40 bg-slate-700 rounded" />
            <div className="h-6 w-24 bg-slate-700 rounded" />
            <div className="h-10 w-64 bg-slate-700 rounded" />
            <div className="h-12 w-56 bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-slate-200">
        <p>Produit introuvable.</p>
        <button
          className="mt-6 px-4 py-2 rounded-xl bg-slate-700"
          onClick={() => navigate(-1)}
        >
          ← Retour
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-slate-100">
      <h1 className="text-3xl font-semibold mb-1">{product.name}</h1>
      <p className="text-slate-400 mb-6">{product.brand || "—"}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image principale */}
        <div className="rounded-2xl p-4 bg-slate-900/60 border border-slate-800">
          {selectedVariant?.image || product.image ? (
            <img
              src={selectedVariant?.image || product.image!}
              alt={product.name}
              className="w-full h-auto rounded-xl object-contain"
            />
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-500">
              Pas d’image
            </div>
          )}
        </div>

        {/* Détails */}
        <div className="space-y-6">
          <div className="text-2xl">{eurosFromCents(displayPriceCents)}</div>

          {/* Tailles */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Taille (EU)
            </label>
            <div className="flex flex-wrap gap-2">
              {(product.variants ?? []).map((v) => {
                const selected = String(v.size) === String(selectedSize);
                return (
                  <button
                    key={`${v.sku}-${v.size}`}
                    onClick={() => setSelectedSize(String(v.size || ""))}
                    className={[
                      "px-3 py-2 rounded-xl border transition",
                      selected
                        ? "border-indigo-400 bg-indigo-500/10"
                        : "border-slate-700 bg-slate-800 hover:bg-slate-700",
                    ].join(" ")}
                  >
                    {v.size ?? "—"}
                  </button>
                );
              })}
            </div>
            {(!product.variants || product.variants.length === 0) && (
              <p className="text-slate-400 text-sm mt-2">Pas de variantes</p>
            )}
          </div>

          {/* Infos variantes */}
          <div className="text-sm text-slate-400">
            {selectedVariant?.sku && <p>SKU: {selectedVariant.sku}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={addToCart}
              disabled={!selectedVariant || adding}
              className="px-5 py-3 rounded-2xl bg-emerald-500/90 hover:bg-emerald-500 disabled:opacity-50"
            >
              {adding ? "Ajout..." : "Ajouter au panier"}
            </button>

            <button
              onClick={toggleFavorite}
              className={[
                "px-4 py-3 rounded-2xl border",
                fav
                  ? "border-pink-400 bg-pink-500/10"
                  : "border-slate-700 bg-slate-800 hover:bg-slate-700",
              ].join(" ")}
              title={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              {fav ? "♥ Favori" : "♡ Favori"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
