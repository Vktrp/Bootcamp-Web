import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchKpis, fetchRecentOrders } from "./api";

/* ───── Helpers ───── */
function eurosFromAny(x?: number | null) {
  if (x == null)
    return (0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  return Number(x).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}
function eurosFromCentsOrAmount(cents?: number | null, amount?: number | null) {
  if (typeof amount === "number") return eurosFromAny(amount);
  return eurosFromAny(Number(cents ?? 0) / 100);
}
function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
function statusLabelFr(s?: string | null) {
  const v = (s ?? "").toLowerCase();
  if (v === "delivered" || v === "completed" || v === "fulfilled")
    return "Livrée";
  if (v === "shipped") return "Expédiée";
  if (v === "confirmed") return "Confirmée";
  if (v === "processing") return "En traitement";
  if (v === "pending") return "En attente";
  if (v === "cancelled") return "Annulée";
  return s || "—";
}
function paymentLabelFr(s?: string | null) {
  const v = (s ?? "").toLowerCase();
  if (v === "paid") return "Payé";
  if (v === "refunded") return "Remboursé";
  if (v === "failed") return "Échoué";
  if (v === "pending") return "En attente";
  return s || "—";
}

function Badge({
  kind,
  children,
  size = "sm",
}: {
  kind: "ok" | "warn" | "error" | "info";
  children: React.ReactNode;
  size?: "sm" | "lg";
}) {
  const palette: Record<string, { bg: string; fg: string }> = {
    ok: { bg: "rgba(34,197,94,.18)", fg: "rgb(187,247,208)" },
    warn: { bg: "rgba(234,179,8,.22)", fg: "rgb(253,230,138)" },
    error: { bg: "rgba(239,68,68,.20)", fg: "rgb(254,202,202)" },
    info: { bg: "rgba(59,130,246,.20)", fg: "rgb(191,219,254)" },
  };
  const pad = size === "lg" ? "6px 10px" : "3px 8px";
  const fs = size === "lg" ? 12 : 11;
  return (
    <span
      style={{
        background: palette[kind].bg,
        color: palette[kind].fg,
        padding: pad,
        fontSize: fs,
        borderRadius: 8,
        fontWeight: 800,
        lineHeight: 1,
        whiteSpace: "nowrap",
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}
function statusBadgeFR(status?: string | null) {
  const v = (status ?? "").toLowerCase();
  if (["delivered", "completed", "fulfilled"].includes(v))
    return <Badge kind="ok">{statusLabelFr(status)}</Badge>;
  if (["shipped", "confirmed"].includes(v))
    return <Badge kind="info">{statusLabelFr(status)}</Badge>;
  if (["pending", "processing"].includes(v))
    return <Badge kind="warn">{statusLabelFr(status)}</Badge>;
  if (["cancelled"].includes(v))
    return <Badge kind="error">{statusLabelFr(status)}</Badge>;
  return <Badge kind="info">{statusLabelFr(status)}</Badge>;
}
function payBadgeFR(pay?: string | null) {
  const v = (pay ?? "").toLowerCase();
  if (v === "paid") return <Badge kind="ok">{paymentLabelFr(pay)}</Badge>;
  if (v === "refunded") return <Badge kind="info">{paymentLabelFr(pay)}</Badge>;
  if (v === "failed") return <Badge kind="error">{paymentLabelFr(pay)}</Badge>;
  return <Badge kind="warn">{paymentLabelFr(pay)}</Badge>;
}

/* ───── Component ───── */
export default function Dashboard() {
  const { data: kpis = { products: 0, variants: 0, orders7d: 0, users: 0 } } =
    useQuery({
      queryKey: ["admin-kpis"],
      queryFn: fetchKpis,
    });
  const { data: recent = [] } = useQuery({
    queryKey: ["admin-recent-orders-v2"],
    queryFn: fetchRecentOrders,
  });

  // alignements
  const thLeft = { textAlign: "left" as const };
  const thRight = { textAlign: "right" as const };
  const tdLeft = {
    textAlign: "left" as const,
    verticalAlign: "middle" as const,
  };
  const tdRight = {
    textAlign: "right" as const,
    verticalAlign: "middle" as const,
  };

  return (
    <div className="container-page admin-page" style={{ maxWidth: 1100 }}>
      <style>{`
        .admin-table { font-variant-numeric: tabular-nums; }
        .admin-table thead th {
          font-weight: 700;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .admin-table tbody td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,.05);
        }
        .admin-table tbody tr:last-child td { border-bottom: 0; }
        .admin-table th, .admin-table td { white-space: nowrap; }
        .table-frame { border-radius: 14px; }

        /* espacement horizontal entre les 3 boutons */
        .admin-actions > * + * { margin-left: 12px; }

        /* marge sous le bloc des boutons pour aérer avant les KPIs */
        .admin-actions { margin-bottom: 18px; }
        @media (min-width: 768px) {
          .admin-actions { margin-bottom: 24px; }
        }
      `}</style>

      {/* Boutons d’action */}
      <div className="admin-actions">
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

      {/* KPIs */}
      <div
        className="grid-products"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div className="card admin-card">
          <div className="opacity-80" style={{ fontSize: 13, fontWeight: 600 }}>
            Produits
          </div>
          <div
            style={{
              fontWeight: 900,
              lineHeight: 1.1,
              marginTop: 6,
              fontSize: "clamp(22px, 3.5vw, 36px)",
            }}
          >
            {kpis.products}
          </div>
        </div>
        <div className="card admin-card">
          <div className="opacity-80" style={{ fontSize: 13, fontWeight: 600 }}>
            Variantes
          </div>
          <div
            style={{
              fontWeight: 900,
              lineHeight: 1.1,
              marginTop: 6,
              fontSize: "clamp(22px, 3.5vw, 36px)",
            }}
          >
            {kpis.variants}
          </div>
        </div>
        <div className="card admin-card">
          <div className="opacity-80" style={{ fontSize: 13, fontWeight: 600 }}>
            Commandes 7j
          </div>
          <div
            style={{
              fontWeight: 900,
              lineHeight: 1.1,
              marginTop: 6,
              fontSize: "clamp(22px, 3.5vw, 36px)",
            }}
          >
            {kpis.orders7d}
          </div>
        </div>
        <div className="card admin-card">
          <div className="opacity-80" style={{ fontSize: 13, fontWeight: 600 }}>
            Utilisateurs
          </div>
          <div
            style={{
              fontWeight: 900,
              lineHeight: 1.1,
              marginTop: 6,
              fontSize: "clamp(22px, 3.5vw, 36px)",
            }}
          >
            {kpis.users}
          </div>
        </div>
      </div>

      {/* Dernières commandes */}
      <div className="card admin-wrapper" style={{ marginTop: 6 }}>
        <div
          className="font-semibold mb-3"
          style={{ fontSize: "clamp(16px, 2vw, 18px)" }}
        >
          Dernières commandes
        </div>

        {recent.length === 0 ? (
          <div className="muted">Aucune commande récente.</div>
        ) : (
          <div className="table-frame">
            <div className="table-scroll">
              <table
                className="min-w-full admin-table"
                style={{
                  tableLayout: "fixed",
                  width: "100%",
                  fontSize: "clamp(12px, 1.4vw, 14px)",
                  lineHeight: 1.5,
                  borderCollapse: "separate",
                  borderSpacing: 0,
                }}
              >
                <colgroup>
                  <col style={{ width: 120 }} />
                  <col style={{ width: 180 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 180 }} />
                </colgroup>

                <thead>
                  <tr>
                    <th style={thLeft}>ID</th>
                    <th style={thLeft}>Statut</th>
                    <th style={thLeft}>Paiement</th>
                    <th style={thRight}>Montant</th>
                    <th style={thRight}>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recent.map((o: any) => (
                    <tr key={o.id}>
                      <td className="font-mono opacity-80" style={tdLeft}>
                        {o.id}
                      </td>
                      <td style={tdLeft}>{statusBadgeFR(o.status)}</td>
                      <td style={tdLeft}>{payBadgeFR(o.payment_status)}</td>
                      <td style={tdRight}>
                        {eurosFromCentsOrAmount(o.total_cents, o.total_amount)}
                      </td>
                      <td style={tdRight}>{fmtDate(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 text-xs opacity-70">
      </div>
    </div>
  );
}
