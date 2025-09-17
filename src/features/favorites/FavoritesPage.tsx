// src/features/favorites/FavoritesPage.tsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listFavorites } from "./api";
import { formatPrice } from "../../lib/utils";

export default function FavoritesPage() {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["favorites"],
    queryFn: listFavorites,
    initialData: [],
  });

  return (
    <div className="container-page">
      <h1 className="text-xl font-semibold mb-2">Mes favoris</h1>

      {isLoading && <div className="card p-4">Chargement…</div>}
      {error && (
        <div className="card p-4 text-danger">Erreur de chargement.</div>
      )}

      {!isLoading && !error && (data as any[]).length === 0 && (
        <div className="card p-4 max-w-md mx-auto text-center">
          Vous n’avez pas encore de favoris.
        </div>
      )}

      {(data as any[]).length > 0 && (
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
      )}
    </div>
  );
}
