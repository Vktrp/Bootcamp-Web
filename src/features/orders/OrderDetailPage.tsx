import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrder } from "./api";
import { formatPrice } from "../../lib/utils";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: o,
    isLoading,
    error,
  } = useQuery({ queryKey: ["order", id], queryFn: () => getOrder(id!) });
  if (isLoading) return <p>Chargement…</p>;
  if (error || !o) return <p>Introuvable</p>;
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Commande #{o.id}</h1>
      <div className="card">
        {o.items?.map((it: any) => (
          <div key={it.id} className="flex justify-between">
            <span>
              {it.variant?.sku} × {it.qty}
            </span>
            <span>{formatPrice(it.priceCents * it.qty)}</span>
          </div>
        ))}
        <div className="mt-2 font-semibold flex justify-between">
          <span>Total</span>
          <span>{formatPrice(o.amountCents)}</span>
        </div>
      </div>
    </div>
  );
}
