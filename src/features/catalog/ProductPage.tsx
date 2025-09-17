// src/features/catalog/ProductPage.tsx
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getProduct, type Product, type Variant } from "./api";
import { supabase } from "../../lib/supabase";

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
    error,
  } = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
    enabled: Boolean(productId),
  });

  const variants: Variant[] = useMemo(() => {
    const seen = new Set<string>();
    const arr: Variant[] = [];
    for (const v of p?.variants ?? []) {
      const k = `${v.sku}|${v.size ?? ""}`;
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

  const [size, setSize] = useState<string>("");
  const [fav, setFav] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (variants.length && !size) setSize(String(variants[0].size || ""));
    if (p) {
      const favs = new Set<string>(
        JSON.parse(localStorage.getItem("favs") || "[]")
      );
      setFav(favs.has(p.id));
    }
  }, [variants, size, p]);

  const selectedVariant = useMemo(
    () => variants.find((v) => String(v.size) === String(size)),
    [variants, size]
  );
  const displayPriceCents =
    selectedVariant?.priceCents ?? p?.priceCents ?? null;

  async function toggleFavorite() {
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
      if (user) {
        const { error } = await supabase.from("shopping_carts").insert({
          user_id: user.id,
          product_variant_id: selectedVariant.sku, // ou variant_id selon ton choix
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
        };
        const key = "cart_local";
        const cart = JSON.parse(
          localStorage.getItem(key) || "[]"
        ) as LocalItem[];
        const idv = selectedVariant.sku;
        const idx = cart.findIndex(
          (i) => i.variant_id === idv && i.size === selectedVariant.size
        );
        if (idx >= 0) cart[idx].qty += 1;
        else
          cart.push({
            variant_id: idv,
            name: p.name,
            size: selectedVariant.size,
            priceCents: displayPriceCents ?? undefined,
            image: selectedVariant.image ?? p.image,
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
      <div className="mx-auto max-w-6xl px-4 py-10 text-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(320px,560px)_1fr] gap-10">
          <div className="h-[420px] rounded-2xl bg-slate-800" />
          <div className="space-y-4">
            <div className="h-8 w-72 bg-slate-700 rounded" />
            <div className="h-6 w-36 bg-slate-700 rounded" />
            <div className="h-8 w-40 bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !p) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-slate-200">
        <p>Produit introuvable.</p>
        <div className="mt-6 flex gap-3">
          <button
            className="px-4 py-2 rounded-xl bg-slate-700"
            onClick={() => history.back()}
          >
            ← Retour
          </button>
          <Link to="/products" className="px-4 py-2 rounded-xl bg-slate-700">
            Tous les produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-slate-100">
      {/* 2 colonnes dès md: image à gauche (largeur bornée), fiche à droite */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(320px,560px)_1fr] gap-10">
        {/* COL GAUCHE — visuel cadré */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
          <div
            className="mx-auto w-full overflow-hidden"
            style={{ aspectRatio: "4 / 3", maxWidth: 560 }} // largeur max ≈ StyleVana
          >
            {selectedVariant?.image || p.image ? (
              <img
                src={selectedVariant?.image || (p.image as string)}
                alt={p.name}
                className="h-full w-full object-contain"
                style={{ maxHeight: 460 }} // hauteur bornée
                loading="eager"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-500">
                Pas d’image
              </div>
            )}
          </div>
        </div>

        {/* COL DROITE — fiche produit (comme StyleVana) */}
        <div className="md:sticky md:top-24 space-y-6">
          {/* Titre + marque en haut */}
          <div>
            <h1 className="text-3xl font-semibold">{p.name}</h1>
            <p className="text-slate-400">{p.brand || "—"}</p>
          </div>

          {/* Prix bien visible */}
          <div className="text-3xl font-medium">
            {eurosFromCents(displayPriceCents)}
          </div>

          {/* Tailles */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Taille (EU)
            </label>
            <div className="flex flex-wrap gap-2">
              {variants.length ? (
                variants.map((v, i) => {
                  const selected = String(v.size) === String(size);
                  return (
                    <button
                      key={`${v.sku}-${v.size}-${i}`}
                      onClick={() => setSize(String(v.size || ""))}
                      className={[
                        "min-w-[44px] px-3 py-2 rounded-xl border transition text-sm",
                        selected
                          ? "border-indigo-400 bg-indigo-500/10"
                          : "border-slate-700 bg-slate-800 hover:bg-slate-700",
                      ].join(" ")}
                    >
                      {v.size ?? "—"}
                    </button>
                  );
                })
              ) : (
                <p className="text-slate-400 text-sm">Pas de variantes</p>
              )}
            </div>
          </div>

          {/* Infos variant */}
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
            >
              {fav ? "♥ Favori" : "♡ Favori"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
