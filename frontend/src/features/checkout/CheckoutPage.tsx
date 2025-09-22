import { useState } from "react";

 import { useSelector, useDispatch } from "react-redux";

 import { useNavigate } from "react-router-dom";

 import { createOrderFromCart, computeCartTotal } from "./api";

 import { selectItems, clearCart } from "@/features/cart/slice";

 import { selectUser } from "@/features/auth/slice";

 export default function CheckoutPage() {

  const items = useSelector(selectItems) as any[];

  const user = useSelector(selectUser);

  const total = computeCartTotal(items);

  const nav = useNavigate();

  const dispatch = useDispatch();

  const [email, setEmail] = useState(user?.email ?? "");

  const [fullName, setFullName] = useState(

    [user?.first_name, user?.last_name].filter(Boolean).join(" ")

  );

  const [address, setAddress] = useState(user?.address ?? "");

  const [cardNumber, setCardNumber] = useState("");

  const [cardExp, setCardExp] = useState(""); // MM/YY

  const [cardCvc, setCardCvc] = useState("");

  const [loading, setLoading] = useState(false);

  const [err, setErr] = useState<string | null>(null);

  async function onPay(e: React.FormEvent) {

    e.preventDefault();

    if (!items?.length) {

      setErr("Votre panier est vide.");

      return;

    }

    setErr(null);

    setLoading(true);

    try {

      const { orderId } = await createOrderFromCart(

        user ?? null,

        items,

        {

          email,

          full_name: fullName || null,

          address: address || null,

          cardNumber,

          cardExp,

          cardCvc,

        }

      );

      // vidage panier + redirection

      dispatch(clearCart());

      nav(`/order/${orderId}/confirmation`, { replace: true });

    } catch (e: any) {

      setErr(e?.message || "Paiement impossible.");

    } finally {

      setLoading(false);

    }

  }

  return (
<div className="container-page" style={{ maxWidth: 760 }}>
<div className="grid md:grid-cols-2 gap-4">
<div className="card">
<h2 className="text-lg font-semibold mb-3">Informations</h2>
<form onSubmit={onPay} className="space-y-3">
<div>
<label>Nom complet</label>
<input className="input" value={fullName} onChange={e => setFullName(e.target.value)} />
</div>
<div>
<label>Email</label>
<input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
</div>
<div>
<label>Adresse</label>
<textarea className="input" value={address} onChange={e => setAddress(e.target.value)} />
</div>
<h3 className="mt-4 font-semibold">Carte bancaire (démo)</h3>
<div>
<label>Numéro de carte</label>
<input className="input" inputMode="numeric" placeholder="4242 4242 4242 4242"

                     value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
</div>
<div className="grid grid-cols-2 gap-3">
<div>
<label>Expiration (MM/YY)</label>
<input className="input" placeholder="12/26"

                       value={cardExp} onChange={e => setCardExp(e.target.value)} />
</div>
<div>
<label>CVC</label>
<input className="input" inputMode="numeric" placeholder="123"

                       value={cardCvc} onChange={e => setCardCvc(e.target.value)} />
</div>
</div>

            {err && <div className="text-danger">{err}</div>}
<button className="btn" disabled={loading}>

              {loading ? "Paiement…" : `Payer ${total.toLocaleString("fr-FR",{style:"currency",currency:"EUR"})}`}
</button>
</form>
</div>
<div className="card">
<h2 className="text-lg font-semibold mb-3">Récapitulatif</h2>
<div className="space-y-2">

            {items.map((it, i) => (
<div key={i} className="flex items-center justify-between">
<div className="opacity-80">

                  {it.name} {it.size ? `(EU ${it.size})` : ""}
</div>
<div>

                  {(typeof it.priceCents === "number"

                    ? it.priceCents / 100

                    : Number(it.price ?? 0)

                  ).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}

                  {" × "}{it.qty ?? 1}
</div>
</div>

            ))}
<div className="border-t border-white/10 mt-2 pt-2 flex items-center justify-between font-semibold">
<span>Total</span>
<span>{total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
</div>
</div>
</div>
</div>
</div>

  );

 }