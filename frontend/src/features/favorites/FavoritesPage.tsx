import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueries, UseQueryResult } from "@tanstack/react-query";
import { getProduct, type Product } from "../catalog/api";
import { pickGroupImage, groupByCanon } from "../../lib/colors";

function euros(cents?: number | null) {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

/** Récupère la liste d'IDs favoris (Redux si tu l’as, sinon localStorage) */
function useFavoriteIds(): string[] {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    // fallback localStorage
    const raw = localStorage.getItem("favs");
    setIds(
      Array.isArray(JSON.parse(raw || "[]")) ? JSON.parse(raw || "[]") : []
    );
    // écoute les modifs d'autres onglets
    const onStorage = (e: StorageEvent) => {
      if (e.key === "favs") {
        const next = Array.isArray(JSON.parse(e.newValue || "[]"))
          ? JSON.parse(e.newValue || "[]")
          : [];
        setIds(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return ids;
}

export default function FavoritesPage() {
  const ids = useFavoriteIds();

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["product", id],
      queryFn: () => getProduct(id),
      enabled: Boolean(id),
      staleTime: 60_000,
    })),
  }) as UseQueryResult<Product>[];

  const cards = useMemo(() => {
    return queries.map((q, i) => {
      const id = ids[i];
      const p = q.data;
      if (!p) {
        return {
          id,
          name: "Produit introuvable",
          image: undefined as string | undefined,
          priceCents: null as number | null,
          loading: q.isLoading,
        };
      }
      // Image robuste : image du groupe couleur si dispo, sinon p.image, sinon 1ère image de variante
      const colorGroups = groupByCanon((p.variants || []) as any);
      const firstGroup = colorGroups.size > 0 ? [...colorGroups.values()][0] : undefined;
      const image =
        pickGroupImage(firstGroup) ||
        (p.image as string | undefined) ||
        (p.variants?.find((v: any) => v.image)?.image as string | undefined);

      const priceCents =
        (p as any).priceCents ??
        (p.variants || [])
          .map((v: any) => Number(v.priceCents || v.price || 0))
          .filter((n) => !Number.isNaN(n))
          .sort((a, b) => a - b)[0] ??
        null;

      return {
        id: p.id,
        name: p.name,
        image,
        priceCents,
        loading: q.isLoading,
      };
    });
  }, [queries, ids]);

  function toggleFav(id: string) {
    const raw = localStorage.getItem("favs");
    const set = new Set<string>(
      Array.isArray(JSON.parse(raw || "[]")) ? JSON.parse(raw || "[]") : []
    );
    set.has(id) ? set.delete(id) : set.add(id);
    localStorage.setItem("favs", JSON.stringify([...set]));
    // force refresh liste
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "favs",
        newValue: JSON.stringify([...set]),
      })
    );
  }

  return (
    <div className="container-page">
      <h1 className="title-xl" style={{ marginBottom: 12 }}>
        Mes favoris
      </h1>
      {ids.length === 0 && (
        <div className="empty-box">Aucun favori pour le moment.</div>
      )}

      <div className="grid-products" style={{ marginTop: 12 }}>
        {cards.map((c) => (
          <div key={c.id} className="card product-card" style={{ padding: 12 }}>
            <Link
              to={`/product/${encodeURIComponent(c.id)}`}
              className="thumb"
              aria-label={c.name}
            >
              {c.image ? (
                <img src={c.image} alt={c.name} className="thumb" />
              ) : (
                <div className="thumb skeleton" />
              )}
            </Link>
            <div className="meta">
              <div className="name">{c.name}</div>
              <div className="price">{euros(c.priceCents)}</div>
            </div>

            <div className="mt-2" style={{ display: "flex", gap: 8 }}>
              <Link
                to={`/product/${encodeURIComponent(c.id)}`}
                className="btn-outline"
                style={{ flex: 1 }}
              >
                Voir le produit
              </Link>
              <button
                className="btn-outline"
                onClick={() => toggleFav(c.id)}
                title="Retirer"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
