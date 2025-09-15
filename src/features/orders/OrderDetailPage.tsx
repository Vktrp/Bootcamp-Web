// src/features/orders/OrderDetailPage.tsx
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrder } from "./api"; 

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id!),
    enabled: !!id,
  });

  if (!id) return <p>Commande inconnue.</p>;
  if (isLoading) return <p>Chargement…</p>;
  if (error) return <p>Erreur de chargement.</p>;

  return (
    <div className="container-page" style={{ maxWidth: 900 }}>
      <h1 className="text-xl font-semibold mb-2">Commande #{data!.id}</h1>
      <div className="card" style={{ padding: 16 }}>
        <div>Statut : {data!.status}</div>
        <div>Montant : {(data!.amountCents / 100).toFixed(2)} €</div>
        <div>Date : {new Date(data!.createdAt).toLocaleString()}</div>
      </div>
      <div style={{ marginTop: 12 }}>
        <Link className="btn-outline" to="/orders">
          Retour à mes commandes
        </Link>
      </div>
    </div>
  );
}
