// src/features/admin/Dashboard.tsx
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type AdminStats = {
  users: number;
  orders: number;
  revenueCents: number;
  sellers: number;
  lastOrders: Array<{ id: string; total_cents: number; created_at: string }>;
  topSellers: Array<{
    seller_id: string;
    email?: string;
    revenueCents: number;
  }>;
};

async function fetchAdminStats(): Promise<AdminStats> {
  // Comptes
  const { count: users } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Commandes
  const { data: ordersRows } = await supabase
    .from("orders")
    .select("id, total_cents, created_at")
    .order("created_at", { ascending: false });

  const orders = ordersRows?.length ?? 0;
  const revenueCents = (ordersRows ?? []).reduce(
    (s, o: any) => s + (o.total_cents ?? 0),
    0
  );
  const lastOrders = (ordersRows ?? []).slice(0, 5);

  // Sellers
  const { data: sellerProfiles } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("role", "seller");
  const sellers = sellerProfiles?.length ?? 0;

  // Top sellers (agrégation côté client)
  const { data: items } = await supabase
    .from("order_items")
    .select("seller_id, qty, unit_price_cents");
  const bySeller = new Map<string, number>();
  (items ?? []).forEach((it: any) => {
    const rev = (it.qty ?? 0) * (it.unit_price_cents ?? 0);
    bySeller.set(it.seller_id, (bySeller.get(it.seller_id) ?? 0) + rev);
  });
  const topSellers = Array.from(bySeller.entries())
    .map(([seller_id, revenueCents]) => ({
      seller_id,
      email: sellerProfiles?.find((p) => p.id === seller_id)?.email,
      revenueCents,
    }))
    .sort((a, b) => b.revenueCents - a.revenueCents)
    .slice(0, 5);

  return {
    users: users ?? 0,
    orders,
    revenueCents,
    sellers,
    lastOrders,
    topSellers,
  };
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminStats"],
    queryFn: fetchAdminStats,
  });

  const stats = data ?? {
    users: 0,
    orders: 0,
    revenueCents: 0,
    sellers: 0,
    lastOrders: [],
    topSellers: [],
  };

  return (
    <div className="container-page" style={{ maxWidth: 1200 }}>
      <h1 className="text-xl font-semibold mb-2">Tableau de bord admin</h1>

      {error && (
        <p className="text-danger">
          Impossible de charger les stats (vérifie les policies RLS pour les
          admins).
        </p>
      )}

      <div
        className="grid-products"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
      >
        <div className="card">
          <div className="text-sm">Utilisateurs</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {isLoading ? "…" : stats.users}
          </div>
        </div>
        <div className="card">
          <div className="text-sm">Commandes</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {isLoading ? "…" : stats.orders}
          </div>
        </div>
        <div className="card">
          <div className="text-sm">Sellers</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {isLoading ? "…" : stats.sellers}
          </div>
        </div>
        <div className="card">
          <div className="text-sm">Chiffre d’affaires</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {isLoading ? "…" : (stats.revenueCents / 100).toFixed(2)} €
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginTop: 16,
        }}
      >
        <div className="card" style={{ padding: 16 }}>
          <div className="font-semibold mb-2">5 dernières commandes</div>
          <div className="space-y-2">
            {(stats.lastOrders ?? []).length === 0 && (
              <div className="text-sm">Aucune commande.</div>
            )}
            {(stats.lastOrders ?? []).map((o) => (
              <div
                key={o.id}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>
                  #{o.id.slice(0, 8)} —{" "}
                  {new Date(o.created_at).toLocaleString()}
                </span>
                <span style={{ fontWeight: 700 }}>
                  {(o.total_cents / 100).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="font-semibold mb-2">Top sellers</div>
          <div className="space-y-2">
            {(stats.topSellers ?? []).length === 0 && (
              <div className="text-sm">Aucun vendeur.</div>
            )}
            {(stats.topSellers ?? []).map((s) => (
              <div
                key={s.seller_id}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>{s.email ?? s.seller_id.slice(0, 8)}</span>
                <span style={{ fontWeight: 700 }}>
                  {(s.revenueCents / 100).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm mt-3">
        Astuce : ces chiffres dépendent des policies RLS. Les admins doivent
        avoir un droit de lecture global (voir ci-dessous).
      </p>
    </div>
  );
}
