import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectUser } from "../auth/slice";
import { supabase } from "@/lib/supabase";

type SellerStats = {
  soldPairs: number;
  returnedPairs: number;
  viewedPairs: number;
  revenueCents: number;
};

async function fetchSellerStats(userId: string): Promise<SellerStats> {
  // Récupère les lignes vendues par ce seller (si la table existe)
  const { data: items, error } = await supabase
    .from("order_items")
    .select("qty, unit_price_cents")
    .eq("seller_id", userId);

  if (error || !items) {
    return { soldPairs: 0, returnedPairs: 0, viewedPairs: 0, revenueCents: 0 };
  }

  const soldPairs = items.reduce((n: number, it: any) => n + (it.qty ?? 0), 0);
  const revenueCents = items.reduce(
    (s: number, it: any) => s + (it.qty ?? 0) * (it.unit_price_cents ?? 0),
    0
  );

  // Si tu ajoutes plus tard des tables returns/views, branche-les ici
  return { soldPairs, returnedPairs: 0, viewedPairs: 0, revenueCents };
}

export default function SellerDashboard() {
  const user = useSelector(selectUser);
  const userId = user?.id ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["sellerStats", userId],
    queryFn: () =>
      userId
        ? fetchSellerStats(userId)
        : Promise.resolve({
            soldPairs: 0,
            returnedPairs: 0,
            viewedPairs: 0,
            revenueCents: 0,
          }),
    enabled: !!userId,
  });

  const stats = data ?? {
    soldPairs: 0,
    returnedPairs: 0,
    viewedPairs: 0,
    revenueCents: 0,
  };

  return (
    <div className="container-page" style={{ maxWidth: 1100 }}>
      <h1 className="text-xl font-semibold mb-2">Espace vendeur</h1>

      <div
        className="grid-products"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
      >
        <div className="card">
          <div className="text-sm">Paires vendues</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {isLoading ? "…" : stats.soldPairs}
          </div>
        </div>
        <div className="card">
          <div className="text-sm">Paires retournées</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {isLoading ? "…" : stats.returnedPairs}
          </div>
        </div>
        <div className="card">
          <div className="text-sm">Paires regardées</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {isLoading ? "…" : stats.viewedPairs}
          </div>
        </div>
        <div className="card">
          <div className="text-sm">Chiffre d’affaires</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {isLoading ? "…" : (stats.revenueCents / 100).toFixed(2)} €
          </div>
        </div>
      </div>

      {/* Section commandes à préparer */}
      <h2 className="text-xl font-semibold mt-3">Commandes à préparer</h2>
      <div className="card" style={{ padding: 16, marginTop: 8 }}>
        <div className="text-sm">
          Aucune commande à préparer pour le moment.
        </div>
      </div>
    </div>
  );
}
