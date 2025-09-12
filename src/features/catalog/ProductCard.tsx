import { Link } from "react-router-dom";
import { formatPrice } from "../../lib/utils";
import type { Product } from "./types";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <div className="card product-card">
      <img src={p.images?.[0] || "https://via.placeholder.com/640x480"} alt={p.name} />
      <div className="mt-3">
        <h3 className="font-semibold" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</h3>
        <p className="text-sm">{p.brand}</p>
        <p className="mt-1 font-semibold">{formatPrice(p.priceCents)}</p>
        <Link to={`/product/${p.id}`} className="btn mt-3">Voir</Link>
      </div>
    </div>
  );
}
