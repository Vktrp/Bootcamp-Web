import { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../app/store";
import {
  selectCartItems,
  selectCartTotalCents,
  clearCart,
  setQty,
  removeItem,
} from "../cart/slice";
import { Link, useNavigate } from "react-router-dom";

function euros(cents?: number | null) {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector((s: RootState) => selectCartItems(s));
  const itemsTotal = useSelector((s: RootState) => selectCartTotalCents(s));

  // form local (pré-rempli si tu as auth.user plus tard)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // CB fictive
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const valid = useMemo(() => {
    return (
      fullName.trim() &&
      email.includes("@") &&
      address.trim() &&
      cardNumber.replace(/\s+/g, "").length >= 12 &&
      /\d{2}\/\d{2}/.test(expiry) &&
      /^\d{3,4}$/.test(cvc)
    );
  }, [fullName, email, address, cardNumber, expiry, cvc]);

  function pay() {
    if (!valid) return;
    // Ici tu pourrais appeler ton backend pour créer la commande
    // On “vide” le panier et redirige vers la confirmation
    dispatch(clearCart());
    navigate("/checkout/success/DEMO1234");
  }

  if (!items.length) {
    return (
      <div className="container-page">
        <div className="card">
          <div className="text-sm">Votre panier est vide.</div>
          <div className="mt-2">
            <Link to="/products" className="btn-outline">
              ← Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container-page"
      style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 0.8fr" }}
    >
      {/* ===== Colonne gauche : formulaire ===== */}
      <div className="card">
        <h2 className="title-xl" style={{ fontSize: 22, marginBottom: 12 }}>
          Informations
        </h2>

        <label>Nom complet</label>
        <input
          className="input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nom complet"
        />

        <div className="mt-2">
          <label>Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </div>

        <div className="mt-2">
          <label>Adresse</label>
          <textarea
            className="input"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Adresse de livraison"
          />
        </div>

        <h3 className="title-xl" style={{ fontSize: 18, margin: "18px 0 8px" }}>
          Paiement (démo)
        </h3>
        <div
          className="grid"
          style={{
            display: "grid",
            gap: 8,
            gridTemplateColumns: "1fr 140px 100px",
          }}
        >
          <div>
            <label>Numéro de carte</label>
            <input
              className="input"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>
          <div>
            <label>Expiration</label>
            <input
              className="input"
              placeholder="MM/AA"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
          </div>
          <div>
            <label>CVC</label>
            <input
              className="input"
              placeholder="CVC"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-3">
          <button className="btn" onClick={pay} disabled={!valid}>
            Payer {euros(itemsTotal)}
          </button>
        </div>
      </div>

      {/* ===== Colonne droite : récap ===== */}
      <div className="card">
        <h2 className="title-xl" style={{ fontSize: 22, marginBottom: 12 }}>
          Récapitulatif
        </h2>

        <div className="mt-2" style={{ display: "grid", gap: 10 }}>
          {items.map((it) => {
            const line = (it.priceCents || 0) * (it.qty || 1);
            return (
              <div
                key={it.sku + ":" + (it.size ?? "")}
                className="card"
                style={{
                  display: "grid",
                  gridTemplateColumns: "84px 1fr auto",
                  gap: 10,
                  padding: 10,
                }}
              >
                <div
                  style={{
                    width: 84,
                    height: 64,
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "var(--bg)",
                  }}
                >
                  {it.image ? (
                    <img
                      src={it.image}
                      alt={it.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className="skeleton"
                      style={{ width: "100%", height: "100%" }}
                    />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{it.name}</div>
                  <div className="text-sm">
                    Taille EU: {String(it.size ?? "—")}
                  </div>
                  <div className="text-sm">Prix: {euros(it.priceCents)}</div>
                  <div
                    className="text-sm"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 6,
                    }}
                  >
                    <label>Qté</label>
                    <input
                      className="input"
                      style={{ width: 90 }}
                      type="number"
                      min={1}
                      value={it.qty ?? 1}
                      onChange={(e) =>
                        dispatch(
                          setQty({
                            key: it.sku + ":" + (it.size ?? ""),
                            qty: Math.max(1, Number(e.target.value)),
                          })
                        )
                      }
                    />
                    <button
                      className="btn-outline"
                      onClick={() =>
                        dispatch(
                          removeItem({
                            key: it.sku + ":" + (it.size ?? ""),
                          })
                        )
                      }
                      title="Retirer"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
                <div style={{ fontWeight: 700, alignSelf: "center" }}>
                  {euros(line)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="menu-divider" style={{ margin: "12px 0" }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 800,
          }}
        >
          <span>Total</span>
          <span>{euros(itemsTotal)}</span>
        </div>
      </div>
    </div>
  );
}
