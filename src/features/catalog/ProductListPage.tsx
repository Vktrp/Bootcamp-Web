import { useQuery } from "@tanstack/react-query";
import { listProducts } from "./api";
import ProductCard from "./ProductCard";
import { useSearchParams } from "react-router-dom";

export default function ProductListPage() {
  const [params] = useSearchParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["products", params.toString()],
    queryFn: () => listProducts(Object.fromEntries(params.entries())),
  });

  return (
    <div className="space-y">
      {/* filtres à ta sauce */}
      {isLoading && <p>Chargement…</p>}
      {error && <p className="text-danger">Erreur de chargement.</p>}
      <div className="grid-products">
        {data?.items.map(p => (<ProductCard key={p.id} p={p} />))}
      </div>
    </div>
  );
}
