import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "./api";
import ProductCard from "./ProductCard";
import Hero from "../../components/Hero"; // <-- ajout

export default function ProductListPage() {
  const [params] = useSearchParams();
  const hasFilter = params.toString().length > 0;

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", params.toString()],
    queryFn: () => listProducts(Object.fromEntries(params.entries())),
  });

  return (
    <div>
      {!hasFilter && <Hero />}

      {/* Si tu as un composant Filters, laisse-le ici, sinon ignore */}
      {/* <Filters /> */}

      {isLoading && (
        <div className="grid-products">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton" style={{ height: 180 }} />
              <div className="skeleton mt-2" style={{ height: 16, width: "70%", borderRadius: 8 }} />
              <div className="skeleton mt-2" style={{ height: 14, width: "40%", borderRadius: 8 }} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && <p className="text-danger">Erreur de chargement.</p>}

      <div className="grid-products">
        {data?.items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
