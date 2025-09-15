import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [counts, setCounts] = useState<{
    users: number;
    orders: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const [{ count: u }, { count: o }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
      ]);
      setCounts({ users: u ?? 0, orders: o ?? 0 });
    })();
  }, []);

  return (
    <div className="container-page" style={{ marginTop: 24 }}>
      <h1 className="title" style={{ fontSize: 32, marginBottom: 16 }}>
        Admin
      </h1>
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        }}
      >
        <div className="card" style={{ padding: 16 }}>
          <div className="text-sm">Utilisateurs</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>
            {counts?.users ?? "…"}
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="text-sm">Commandes</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>
            {counts?.orders ?? "…"}
          </div>
        </div>
      </div>
    </div>
  );
}
