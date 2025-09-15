// src/features/orders/OrderListPage.tsx
import { useQuery } from "@tanstack/react-query";
import { listMyOrders } from "./api";
import { Link } from "react-router-dom";
import { formatPrice } from "../../lib/utils";
import { useSelector } from "react-redux";
import { selectUser } from "../auth/slice";

type OrderLike = {
  id: string;
  createdAt?: string;
  created_at?: string;
  status?: string;
  amountCents?: number;
  totalCents?: number;
  total_cents?: number;
};

export default function OrderListPage() {
  const user = useSelector(selectUser);

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", user?.id],
    // Compatible avec listMyOrders(email) ou listMyOrders()
    queryFn: async () => {
      try {
        return await (listMyOrders as any)(user?.email);
      } catch {
        return await (listMyOrders as any)();
      }
    },
    enabled: !!user, // ne requête que si connecté
  });

  if (!user) {
    return (
      <div className="container-page" style={{ maxWidth: 900 }}>
        <h1 className="text-xl font-semibold mb-2">Mes commandes</h1>
        <div className="card" style={{ padding: 16 }}>
          <p className="text-sm">
            Veuillez vous connecter pour consulter vos commandes.
          </p>
          <Link to="/login" className="btn" style={{ marginTop: 12 }}>
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container-page" style={{ maxWidth: 900 }}>
        <h1 className="text-xl font-semibold mb-2">Mes commandes</h1>
        <div className="space-y-2">
          <div className="card skeleton" style={{ height: 68 }} />
          <div className="card skeleton" style={{ height: 68 }} />
          <div className="card skeleton" style={{ height: 68 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page" style={{ maxWidth: 900 }}>
        <h1 className="text-xl font-semibold mb-2">Mes commandes</h1>
        <div className="card" style={{ padding: 16 }}>
          <p className="text-danger">Erreur de chargement des commandes.</p>
        </div>
      </div>
    );
  }

  const orders: OrderLike[] = (data as any) ?? [];

  if (orders.length === 0) {
    return (
      <div className="container-page" style={{ maxWidth: 900 }}>
        <h1 className="text-xl font-semibold mb-2">Mes commandes</h1>
        <div className="card" style={{ padding: 16 }}>
          <p className="text-sm">Pas de commande encore.</p>
          <Link to="/products" className="btn" style={{ marginTop: 12 }}>
            Voir le catalogue
          </Link>
        </div>
      </div>
    );
  }

  function fmtAmount(o: OrderLike) {
    const cents = (o.amountCents ??
      o.totalCents ??
      o.total_cents ??
      0) as number;
    try {
      return formatPrice(cents);
    } catch {
      return (cents / 100).toFixed(2) + " €";
    }
  }

  function fmtDate(o: OrderLike) {
    const d = o.createdAt ?? o.created_at;
    if (!d) return "";
    const dt = new Date(d);
    return dt.toLocaleDateString();
  }

  return (
    <div className="container-page" style={{ maxWidth: 900 }}>
      <h1 className="text-xl font-semibold mb-2">Mes commandes</h1>
      <div className="space-y-2">
        {orders.map((o) => (
          <div
            key={o.id}
            className="card"
            style={{
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>
                Commande #{o.id.slice(0, 8)}
              </div>
              <div className="text-sm">
                {fmtDate(o)} {o.status ? `— ${o.status}` : ""}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontWeight: 900 }}>{fmtAmount(o)}</span>
              <Link className="btn-outline" to={`/orders/${o.id}`}>
                Détail
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
