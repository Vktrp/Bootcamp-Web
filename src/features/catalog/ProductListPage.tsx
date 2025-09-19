// src/features/catalog/ProductListPage.tsx
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Hero from "../../components/Hero";
import { listProducts } from "./api";
import { formatPrice } from "../../lib/utils";

function labelFR(g?: string) {
  if (g === "men") return "Homme";
  if (g === "women") return "Femme";
  if (g === "infant") return "Enfant";
  return "—";
}

export default function ProductListPage() {
  const [params] = useSearchParams();

  const q = params.get("q") || undefined;
  const categorySlug = params.get("category") || undefined;
  const showHero = !q && !categorySlug;

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["products", { q, categorySlug }],
    queryFn: () => listProducts({ q, categorySlug }),
    initialData: [],
  });

  if (isLoading) {
    return (
      <>
        {showHero && <Hero />}
        <div className="container-page">Chargement…</div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        {showHero && <Hero />}
        <div className="container-page text-danger">Erreur de chargement.</div>
      </>
    );
  }

  return (
    <>
      {showHero && <Hero />}

      <div className="container-page">
        <h1 className="text-xl font-semibold mb-2">Produits</h1>

        {/* style léger pour le badge */}
        <style>{`
          .g-badge{
            display:inline-flex; align-items:center; gap:6px;
            font-size:11px; font-weight:800; line-height:1;
            padding:4px 8px; border-radius:999px; white-space:nowrap;
            background: rgba(59,130,246,.18);
            border:1px solid rgba(59,130,246,.45);
            color: rgba(191,219,254,1);
          }
          @media (prefers-color-scheme: light){
            .g-badge{
              background: rgba(37,99,235,.16);
              border-color: rgba(37,99,235,.35);
              color: #1d4ed8;
            }
          }
          .meta-row{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
        `}</style>

        <div className="grid-products">
          {(data as any[]).map((p: any) => {
            // p.id est "silhouette::men|women|infant"
            const search = categorySlug
              ? `?category=${encodeURIComponent(categorySlug)}`
              : q
              ? `?q=${encodeURIComponent(q)}`
              : "";

            return (
              <Link
                key={p.id}
                to={`/product/${encodeURIComponent(p.id)}${search}`}
                className="product-card card"
              >
                <img
                  className="thumb"
                  src={p.image || p.images?.[0] || "https://via.placeholder.com/800x600"}
                  alt={p.name}
                />

                <div className="meta">
                  <div className="meta-row">
                    <div className="name">{p.name}</div>
                    <span className="g-badge">{labelFR(p.groupGender)}</span>
                  </div>
                  {p.brand && <div className="brand">{p.brand}</div>}
                  <div className="price">
                    {formatPrice(p.priceCents ?? p.base_price ?? 0)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
