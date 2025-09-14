import { useSelector, useDispatch } from "react-redux";
import { selectCartTotalCents, removeItem, setQty } from "./slice";
import { formatPrice } from "../../lib/utils";
import { Link, useNavigate } from "react-router-dom";

export default function CartPage() {
  const items = useSelector((s: any) => s.cart.items);
  const total = formatPrice(selectCartTotalCents({ cart: { items } }));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!items.length)
    return (
      <div className="text-center">
        <p>Votre panier est vide.</p>
        <Link to="/products" className="btn mt-4">
          Voir les produits
        </Link>
      </div>
    );

  return (
    <div className="space-y-4">
      {items.map((it: any) => (
        <div
          key={it.variantSKU}
          className="card flex items-center justify-between"
        >
          <div>
            <div className="text-sm text-gray-600">SKU: {it.variantSKU}</div>
            <div className="mt-1">
              Quantité:{" "}
              <input
                type="number"
                min={1}
                className="input w-24"
                value={it.qty}
                onChange={(e) =>
                  dispatch(
                    setQty({ sku: it.variantSKU, qty: Number(e.target.value) })
                  )
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium">
              {formatPrice(it.priceCents * it.qty)}
            </span>
            <button
              className="btn-outline"
              onClick={() => dispatch(removeItem({ sku: it.variantSKU }))}
            >
              Retirer
            </button>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">Total: {total}</span>
        <button className="btn" onClick={() => navigate("/checkout")}>
          Passer au paiement
        </button>
      </div>
    </div>
  );
}
