import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
// Add missing imports for items, name, email, clear, API_URL, formatPrice as needed

const CheckoutPage = () => {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // You may need to define or import items, name, email, clear, API_URL, formatPrice
  // Example placeholders:
  const items: any[] = []; // Replace with actual items from your store or props
  const name = ""; // Replace with actual state or prop
  const email = ""; // Replace with actual state or prop
  const clear = () => ({ type: "CLEAR_CART" }); // Replace with actual clear action from your store
  const API_URL = ""; // Replace with your API URL
  const formatPrice = (price: number) => `${price}€`; // Replace with your formatting function

  const total = items.reduce(
    (sum: any, it: any) => sum + it.priceCents * it.qty,
    0
  );

  async function submit() {
    setError(undefined);
    if (!items.length) {
      setError("Panier vide");
      return;
    }
    if (!name || !email || !address) {
      setError("Veuillez remplir vos informations");
      return;
    }
    setLoading(true);
    try {
      const orderRes = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user-1",
          items: items.map((i: any) => ({ sku: i.variantSKU, qty: i.qty })),
        }),
      });
      if (!orderRes.ok) throw new Error("Création commande échouée");
      const order = await orderRes.json();

      const payRes = await fetch(`${API_URL}/api/orders/payments/mock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, success: true }),
      });
      if (!payRes.ok) throw new Error("Paiement fictif échoué");

      dispatch(clear());
      navigate(`/checkout/success/${order.id}`);
    } catch (e: any) {
      setError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card space-y-3">
        <h2 className="text-lg font-semibold">Informations</h2>
        <input
          className="input"
          placeholder="Nom complet"
          value={name}
          onChange={(e) => {
            /* setName(e.target.value) */
          }}
        />
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            /* setEmail(e.target.value) */
          }}
        />
        <textarea
          className="input h-28"
          placeholder="Adresse"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        {error && <p className="text-red-600">{error}</p>}
        <button className="btn" disabled={loading} onClick={submit}>
          {loading ? "Traitement…" : "Payer (fictif)"}
        </button>
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold mb-2">Récapitulatif</h2>
        <ul className="space-y-1 text-sm">
          {items.map((it: any) => (
            <li key={it.variantSKU} className="flex justify-between">
              <span>
                {it.variantSKU} × {it.qty}
              </span>
              <span>{formatPrice(it.priceCents * it.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
