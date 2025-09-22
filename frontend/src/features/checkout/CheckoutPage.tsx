// frontend/src/features/checkout/CheckoutPage.tsx

import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";

import {
  selectCartItems,
  selectCartTotalCents,
  clearCart,
  type CartItem,
} from "@/features/cart/slice";

import { createOrderFromCart } from "./api";

function euros(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",

    currency: "EUR",
  });
}

export default function CheckoutPage() {
  // store

  const items = useSelector(selectCartItems) as CartItem[];

  const totalCents = useSelector(selectCartTotalCents) as number;

  const user = useSelector((s: any) => s?.auth?.user ?? null); // évite de casser si selectUser n'existe pas

  const [fullName, setFullName] = useState<string>(
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || ""
  );

  const [email, setEmail] = useState<string>(user?.email ?? "");

  const [phone, setPhone] = useState<string>(user?.phone_number ?? "");

  const [address, setAddress] = useState<string>(user?.address_line_1 ?? "");

  // faux formulaire carte (validation minimale)

  const [cardNumber, setCardNumber] = useState("");

  const [expiry, setExpiry] = useState(""); // MM/YY

  const [cvc, setCvc] = useState("");

  const [loading, setLoading] = useState(false);

  const [err, setErr] = useState<string | null>(null);

  const dispatch = useDispatch();

  const nav = useNavigate();

  async function onPay(e: React.FormEvent) {
    e.preventDefault();

    if (items.length === 0) {
      setErr("Votre panier est vide.");

      return;
    }

    // validation ultra simple

    const onlyDigits = cardNumber.replace(/\s+/g, "");

    if (onlyDigits.length < 12) {
      setErr("Numéro de carte invalide.");

      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setErr("Date d'expiration invalide (MM/YY).");

      return;
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      setErr("CVC invalide.");

      return;
    }

    setErr(null);

    setLoading(true);

    try {
      const { orderId } = await createOrderFromCart({
        items,

        shippingAddress: address || null, // on envoie juste une string

        paymentMethod: "Credit Card",
      });

      // succès → vider le panier + aller sur confirmation

      dispatch(clearCart());

      nav(`/order-confirmation?orderId=${orderId}`);
    } catch (e: any) {
      setErr(e?.message || "Échec du paiement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page" style={{ maxWidth: 1100 }}>
      <style>{`

        .grid-pay {

          display: grid;

          gap: 18px;

        }

        @media (min-width: 900px) {

          .grid-pay { grid-template-columns: 1fr 1fr; }

        }

        .card { border-radius: 14px; background: rgba(255,255,255,.04); padding: 16px; }

        .line { display:flex; justify-content:space-between; align-items:center; padding:8px 0; }

        .muted { opacity:.8; }

        .input {

          width: 100%;

          background: rgba(255,255,255,.06);

          border: 1px solid rgba(255,255,255,.08);

          padding: 10px 12px; border-radius: 10px; color: inherit;

        }

        .two { display:grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .btn {

          border: none; border-radius: 12px; padding: 12px 16px;

          font-weight: 700; cursor: pointer;

          background: #7c3aed; /* violet */

        }

        .btn:disabled { opacity:.6; cursor:not-allowed; }

        .price { font-variant-numeric: tabular-nums; }

        .title { font-size: clamp(20px, 2vw, 28px); font-weight: 800; margin: 8px 0 14px; }

        .err { background: rgba(239,68,68,.15); border: 1px solid rgba(239,68,68,.35); padding:12px; border-radius:12px; margin-bottom:12px; }

        .row { display:flex; gap:10px; align-items:center; }

        .thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 8px; background: rgba(255,255,255,.08); }

      `}</style>
      <h1 className="title">Paiement</h1>

      {err && <div className="err">{err}</div>}
      <div className="grid-pay">
        {/* Récapitulatif */}
        <div className="card">
          <div className="muted" style={{ fontWeight: 700, marginBottom: 8 }}>
            Votre commande
          </div>

          {items.length === 0 ? (
            <div className="muted">Panier vide.</div>
          ) : (
            <>
              {items.map((it) => (
                <div className="line" key={it.key}>
                  <div className="row">
                    {/* petite image si disponible */}

                    {it.image ? (
                      <img className="thumb" src={it.image} alt={it.name} />
                    ) : (
                      <div className="thumb" />
                    )}
                    <div style={{ marginLeft: 8 }}>
                      <div style={{ fontWeight: 700 }}>{it.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {it.sku} {it.size ? `• ${it.size}` : ""} — Qté: {it.qty}
                      </div>
                    </div>
                  </div>
                  <div className="price">
                    {euros((it.priceCents ?? 0) * (it.qty ?? 1))}
                  </div>
                </div>
              ))}
              <div
                className="line"
                style={{
                  borderTop: "1px solid rgba(255,255,255,.08)",
                  marginTop: 8,
                  paddingTop: 12,
                }}
              >
                <div style={{ fontWeight: 800 }}>Total</div>
                <div className="price" style={{ fontWeight: 800 }}>
                  {euros(totalCents)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Formulaire livraison + carte */}
        <form className="card" onSubmit={onPay}>
          <div className="muted" style={{ fontWeight: 700, marginBottom: 8 }}>
            Adresse de livraison
          </div>
          <div className="two" style={{ marginBottom: 10 }}>
            <input
              className="input"
              placeholder="Prénom & nom"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="two" style={{ marginBottom: 10 }}>
            <input
              className="input"
              placeholder="Téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="input"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <input
              className="input"
              placeholder="Adresse"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="muted" style={{ fontWeight: 700, margin: "8px 0" }}>
            Paiement par carte
          </div>
          <div style={{ marginBottom: 10 }}>
            <input
              className="input"
              placeholder="Numéro de carte"
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>
          <div className="two" style={{ marginBottom: 16 }}>
            <input
              className="input"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
            <input
              className="input"
              placeholder="CVC"
              inputMode="numeric"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
            />
          </div>
          <button className="btn" disabled={loading || items.length === 0}>
            {loading ? "Paiement en cours..." : `Payer ${euros(totalCents)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
