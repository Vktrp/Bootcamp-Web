// src/features/orders/OrderListPage.tsx
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listMyOrders } from "./api";
import { formatPrice } from "../../lib/utils";

type OrderLike = {
  id: string;
  status?: string;
  amountCents?: number;
  createdAt?: string;
  total_cents?: number; // tolérance
  created_at?: string; // tolérance
};

export default function OrderListPage() {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery<OrderLike[]>({
    queryKey: ["orders"],
    queryFn: listMyOrders,
    initialData: [],
  });

  if (isLoading) {
    return (
      <div className="container-page">
        <div className="card p-4">Chargement…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page">
        <div className="card p-4 text-danger">Erreur de chargement.</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="container-page">
        <h1 className="text-xl font-semibold mb-2">Mes commandes</h1>
        <div className="card p-4 max-w-md mx-auto text-center">
          Pas de commandes récemment.
        </div>
      </div>
    );
  }

  return (
    <div className="container-page">
      <h1 className="text-xl font-semibold mb-2">Mes commandes</h1>

      <div className="grid gap-3">
        {data.map((o) => {
          const cents = o.amountCents ?? o.total_cents ?? 0;
          const dateStr = o.createdAt ?? o.created_at ?? "";
          const when = dateStr ? new Date(dateStr).toLocaleString() : "-";

          return (
            <Link key={o.id} to={`/orders/${o.id}`} className="card p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Commande #{o.id}</div>
                <div className="muted">{when}</div>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <div>Statut : {o.status ?? "-"}</div>
                <div className="font-medium">{formatPrice(cents)}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
