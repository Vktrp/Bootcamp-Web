// src/features/orders/OrderDetailPage.tsx
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrder } from "./api";
import { formatPrice } from "../../lib/utils";

type OrderLike = {
  id: string;
  status?: string;
  amountCents?: number;
  createdAt?: string;
  // tolérance si l'API n'est pas encore mappée :
  total_cents?: number;
  created_at?: string;
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery<OrderLike>({
    queryKey: ["order", id],
    queryFn: () => getOrder(id!),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="container-page">
        <div className="card p-4">Chargement…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container-page">
        <div className="card p-4 max-w-md mx-auto text-center">
          Commande inconnue.
        </div>
      </div>
    );
  }

  const cents = data.amountCents ?? data.total_cents ?? 0;
  const dateStr = data.createdAt ?? data.created_at ?? "";
  const when = dateStr ? new Date(dateStr).toLocaleString() : "-";

  return (
    <div className="container-page">
      <h1 className="text-xl font-semibold mb-2">Commande #{data.id}</h1>

      <div className="card p-4">
        <div className="mb-1">Statut : {data.status ?? "-"}</div>
        <div className="mb-1">Montant : {formatPrice(cents)}</div>
        <div>Date : {when}</div>
      </div>
    </div>
  );
}
