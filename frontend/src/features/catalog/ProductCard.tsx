import { Link } from "react-router-dom";
import type { Product } from "./types";
import { formatPrice } from "../../lib/utils";

export default function ProductCard({ p }: { p: Product }) {
  const low =
    p.variants?.some((v) => v.stock > 0) &&
    p.variants.reduce((min, v) => Math.min(min, v.stock), Infinity) <= 3;

  return (
    <div className="card product-card">
      <img
        className="thumb"
        src={p.images?.[0] || "https://picsum.photos/seed/snk/800/600"}
        alt={p.name}
      />
      <div className="meta">
        <h3 className="name">{p.name}</h3>
        <p className="brand">{p.brand}</p>
        <p className="price">{formatPrice(p.priceCents)}</p>
        <div className="mt-3" style={{ display: "flex", gap: "8px" }}>
          <Link to={`/product/${p.id}`} className="btn">
            Voir
          </Link>
          {low && <span className="badge badge-warning">Stock bas</span>}
        </div>
      </div>
    </div>
  );
}
