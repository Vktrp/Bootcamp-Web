import { useDispatch, useSelector } from "react-redux";
import {
  selectCartItems,
  selectCartTotalCents,
  setQty,
  removeItem,
  clearCart,
} from "./slice";
import type { AppDispatch } from "../../app/store";
import { Link, useNavigate } from "react-router-dom";

function euros(cents?: number | null) {
  return ((cents ?? 0) / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export default function CartPage() {
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotalCents);
  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container-page">
        <div className="card" style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2>Votre panier</h2>
          <p className="mt-2">Votre panier est vide.</p>
          <div className="mt-3">
            <Link className="btn-outline" to="/products">
              ← Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page">
      <div className="card" style={{ maxWidth: 880, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 160px 120px 80px",
            gap: 12,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          <div>Article</div>
          <div>Prix</div>
          <div>Quantité</div>
          <div></div>
        </div>

        {items.map((it) => (
          <div
            key={it.key}
            className="card"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 160px 120px 80px",
              gap: 12,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <img
                src={
                  it.image ||
                  "https://static-00.iconduck.com/assets.00/image-unavailable-icon-512x512-g2lq0z1a.png"
                }
                alt={it.name}
                style={{
                  width: 72,
                  height: 72,
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                }}
              />
              <div>
                <div style={{ fontWeight: 700 }}>{it.name}</div>
                <div className="text-sm">
                  SKU: {it.sku} • Taille EU: {it.size ?? "—"}
                </div>
              </div>
            </div>

            <div style={{ fontWeight: 700 }}>{euros(it.priceCents)}</div>

            <div>
              <input
                type="number"
                min={1}
                className="input"
                value={it.qty ?? 1}
                onChange={(e) =>
                  dispatch(
                    setQty({ key: it.key, qty: Math.max(1, +e.target.value) })
                  )
                }
                style={{ maxWidth: 100 }}
              />
            </div>

            <div>
              <button
                className="btn-outline"
                onClick={() => dispatch(removeItem({ key: it.key }))}
              >
                Retirer
              </button>
            </div>
          </div>
        ))}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 14,
            alignItems: "center",
          }}
        >
          <button className="btn-outline" onClick={() => dispatch(clearCart())}>
            Vider le panier
          </button>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              Total: {euros(total)}
            </div>
            <button className="btn" onClick={() => nav("/checkout")}>
              Passer au paiement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
