import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

type Kpis = {
  products: number;
  variants: number;
  orders7d: number;
  users: number;
};

// on simplifie la signature pour éviter les génériques supabase qui font râler TS
type WhereFn = (q: any) => any;

async function countFirstExisting(
  tables: string[],
  where?: WhereFn
): Promise<number> {
  for (const t of tables) {
    try {
      let q: any = supabase.from(t).select("*", { count: "exact", head: true });
      if (where) q = where(q);
      const { count, error } = await q;
      if (!error && typeof count === "number") return count as number;
    } catch {}
  }
  return 0;
}

async function fetchKpis(): Promise<Kpis> {
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 3600 * 1000
  ).toISOString();
  const [products, variants, orders7d, users] = await Promise.all([
    countFirstExisting(["products", "product_sneakers"]),
    countFirstExisting(["product_variants", "product_variant_sneakers"]),
    countFirstExisting(["orders"], (q) => q.gte("created_at", sevenDaysAgo)),
    countFirstExisting(["users"]),
  ]);
  return { products, variants, orders7d, users };
}

async function fetchRecentOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("id,status,total_cents,created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) return [];
  return data ?? [];
}

export default function Dashboard() {
  const { data: kpis } = useQuery({
    queryKey: ["admin-kpis"],
    queryFn: fetchKpis,
    initialData: { products: 0, variants: 0, orders7d: 0, users: 0 },
  });
  const { data: recent = [] } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: fetchRecentOrders,
    initialData: [],
  });

  return (
    <div className="container-page">
      <div className="flex gap-3 mb-4">
        <Link to="/admin/stock" className="btn-outline">
          Gérer le stock
        </Link>
        <Link to="/admin/create-product" className="btn-outline">
          Créer un produit
        </Link>
        <Link to="/admin/users" className="btn-outline">
          Utilisateurs
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-6">
        <div className="card p-4">
          <div className="muted">Produits</div>
          <div className="text-2xl font-semibold">{kpis.products}</div>
        </div>
        <div className="card p-4">
          <div className="muted">Variantes</div>
          <div className="text-2xl font-semibold">{kpis.variants}</div>
        </div>
        <div className="card p-4">
          <div className="muted">Commandes 7j</div>
          <div className="text-2xl font-semibold">{kpis.orders7d}</div>
        </div>
        <div className="card p-4">
          <div className="muted">Utilisateurs</div>
          <div className="text-2xl font-semibold">{kpis.users}</div>
        </div>
      </div>

      <div className="card p-4">
        <div className="font-semibold mb-2">Dernières commandes</div>
        {recent.length === 0 ? (
          <div className="muted">Aucune commande récente.</div>
        ) : (
          <div className="table-like">
            {recent.map((o: any) => (
              <div key={o.id} className="row">
                <div className="cell">{o.id}</div>
                <div className="cell">{o.status ?? "pending"}</div>
                <div className="cell">
                  {((o.total_cents ?? 0) / 100).toFixed(2)} €
                </div>
                <div className="cell">
                  {new Date(o.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
