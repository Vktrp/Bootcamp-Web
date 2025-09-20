import { Link } from "react-router-dom";
import type { Product } from "../catalog/api"; // ✅ on prend le type retourné par listProducts
import { formatPrice } from "../../lib/utils";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <div className="card product-card">
      <img
        className="thumb"
        src={p.image || "https://via.placeholder.com/800x600"}
        alt={p.name}
      />
      <div className="meta">
        <h3 className="name">{p.name}</h3>
        {p.brand && <p className="brand">{p.brand}</p>}
        <p className="price">{formatPrice(p.priceCents ?? 0)}</p>
        <div className="mt-3" style={{ display: "flex", gap: "8px" }}>
          <Link to={`/product/${encodeURIComponent(p.id)}`} className="btn">
            Voir
          </Link>
        </div>
      </div>
    </div>
  );
}
