// src/features/catalog/ProductListPage.tsx
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Hero from "../../components/Hero";
import { listProducts } from "./api";
import { formatPrice } from "../../lib/utils";

export default function ProductListPage() {
  const [params] = useSearchParams();

  // filtres depuis l'URL
  const q = params.get("q") || undefined;
  const categorySlug = params.get("category") || undefined;

  // on montre le Hero seulement si pas de recherche / pas de filtre catégorie
  const showHero = !q && !categorySlug;

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
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

        <div className="grid-products">
          {(data as any[]).map((p: any) => (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              className="product-card card"
            >
              <img
                className="thumb"
                src={
                  p.image ||
                  p.images?.[0] ||
                  "https://via.placeholder.com/800x600"
                }
                alt={p.name}
              />
              <div className="meta">
                <div className="name">{p.name}</div>
                {p.brand && <div className="brand">{p.brand}</div>}
                <div className="price">
                  {formatPrice(p.priceCents ?? p.base_price ?? 0)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
