import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../auth/slice";

export default function SellerDashboard() {
  const user = useSelector(selectUser)!;
  const [stats, setStats] = useState<{ qty: number; revenue: number } | null>(
    null
  );

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("qty, price_cents")
        .eq("seller_id", user.id);
      if (error) {
        setStats({ qty: 0, revenue: 0 });
        return;
      }
      const qty = data.reduce((s: any, it: any) => s + it.qty, 0);
      const revenue = data.reduce(
        (s: any, it: any) => s + it.qty * it.price_cents,
        0
      );
      setStats({ qty, revenue });
    })();
  }, [user.id]);

  return (
    <div className="container-page" style={{ marginTop: 24 }}>
      <h1 className="title" style={{ fontSize: 32, marginBottom: 16 }}>
        Espace vendeur
      </h1>
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        }}
      >
        <div className="card" style={{ padding: 16 }}>
          <div className="text-sm">Paires vendues</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>
            {stats?.qty ?? "…"}
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="text-sm">Chiffre d’affaires</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>
            {stats ? (stats.revenue / 100).toFixed(2) + " €" : "…"}
          </div>
        </div>
      </div>
    </div>
  );
}
