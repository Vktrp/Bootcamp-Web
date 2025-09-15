// src/features/FavoritesPage.tsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/utils";           // ou ../../lib/utils si tu n'as pas l'alias "@"
import { listFavorites } from "./api";               // adapte le chemin si nécessaire

type FavoriteProduct = {
  id: string | number;
  name: string;
  brand?: string;
  image?: string;
  priceCents?: number;
};

export default function FavoritesPage() {
  // ✅ On typage le résultat et on donne un tableau vide par défaut
  const { data, isLoading, isError } = useQuery<FavoriteProduct[]>({
    queryKey: ["favorites"],
    queryFn: listFavorites,
    initialData: [], // évite data === undefined et empêche TS d'inférer {}
  });

  if (isLoading) return <div className="container-page">Chargement…</div>;
  if (isError)    return <div className="container-page text-danger">Erreur de chargement.</div>;

  const items = data ?? []; // data est déjà un FavoriteProduct[], mais on garde la ceinture+bretelles

  return (
    <div className="container-page" style={{ maxWidth: 1100 }}>
      <h1 className="text-xl font-semibold mb-2" style={{ textAlign: "center" }}>
        Mes favoris
      </h1>

      {items.length === 0 ? (
        <div className="empty-box">
          <span>Vous n’avez pas encore de favoris.</span>
        </div>
      ) : (
        <div className="grid-products">
          {items.map((p) => (
            <div key={p.id} className="product-card card">
              <Link to={`/product/${p.id}`}>
                <img className="thumb" src={p.image} alt={p.name} />
              </Link>
              <div className="meta">
                <div className="name">{p.name}</div>
                <div className="brand">{p.brand ?? "—"}</div>
                <div className="price">
                  {p.priceCents != null ? formatPrice(p.priceCents) : "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
