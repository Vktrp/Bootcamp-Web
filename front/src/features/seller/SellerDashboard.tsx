// src/features/seller/SellerDashboard.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectUser } from "../auth/slice";
import { getStoreStats, getRecentOrders } from "./api";

function euros(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
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
function Badge({
  kind,
  children,
  size = "lg",
}: {
  kind: "ok" | "warn" | "error" | "info";
  children: React.ReactNode;
  size?: "sm" | "lg";
}) {
  const palette: Record<string, { bg: string; fg: string }> = {
    ok: { bg: "rgba(34,197,94,.18)", fg: "rgb(34,197,94)" },
    warn: { bg: "rgba(234,179,8,.22)", fg: "rgb(234,179,8)" },
    error: { bg: "rgba(239,68,68,.20)", fg: "rgb(239,68,68)" },
    info: { bg: "rgba(59,130,246,.20)", fg: "rgb(59,130,246)" },
  };
  const pad = size === "lg" ? "8px 10px" : "4px 8px";
  const fs = size === "lg" ? 12 : 11;
  return (
    <span
      style={{
        background: palette[kind].bg,
        color: palette[kind].fg,
        border: `1px solid ${palette[kind].fg}`,
        padding: pad,
        fontSize: fs,
        borderRadius: 999,
        fontWeight: 700,
        textTransform: "capitalize",
        letterSpacing: 0.2,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
function statusBadge(status?: string | null) {
  const s = (status ?? "").toLowerCase();
  if (["delivered", "completed", "fulfilled"].includes(s))
    return (
      <Badge kind="ok" size="lg">
        {status}
      </Badge>
    );
  if (["shipped", "confirmed"].includes(s))
    return (
      <Badge kind="info" size="lg">
        {status}
      </Badge>
    );
  if (["pending", "processing"].includes(s))
    return (
      <Badge kind="warn" size="lg">
        {status}
      </Badge>
    );
  if (["cancelled"].includes(s))
    return (
      <Badge kind="error" size="lg">
        {status}
      </Badge>
    );
  return (
    <Badge kind="info" size="lg">
      {status || "—"}
    </Badge>
  );
}
function payBadge(pay?: string | null) {
  const s = (pay ?? "").toLowerCase();
  if (s === "paid")
    return (
      <Badge kind="ok" size="lg">
        Paid
      </Badge>
    );
  if (s === "refunded")
    return (
      <Badge kind="info" size="lg">
        Refunded
      </Badge>
    );
  if (s === "failed")
    return (
      <Badge kind="error" size="lg">
        Failed
      </Badge>
    );
  return (
    <Badge kind="warn" size="lg">
      {pay || "Pending"}
    </Badge>
  );
}

export default function SellerDashboard() {
  type User = {
    role?: string;
    // add other properties as needed
  };
  const user = useSelector(selectUser) as User | null;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (!["seller", "admin"].includes(user.role ?? ""))
      navigate("/", { replace: true });
  }, [user, navigate]);

  const statsQ = useQuery({
    queryKey: ["seller_stats_paid"],
    queryFn: getStoreStats,
  });
  const ordersQ = useQuery({
    queryKey: ["seller_orders_recent"],
    queryFn: () => getRecentOrders(20),
  });

  return (
    <div className="container-page seller-page" style={{ maxWidth: 1100 }}>
      <h1 className="text-2xl font-extrabold mb-4">Espace vendeur</h1>

      <div
        className="grid-products mb-6"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
      >
        <div className="card seller-card">
          <div className="opacity-80" style={{ fontSize: 13, fontWeight: 600 }}>
            Paires vendues (global)
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 900,
              lineHeight: 1.1,
              marginTop: 6,
            }}
          >
            {statsQ.isLoading ? "…" : statsQ.data?.soldPairs ?? 0}
          </div>
        </div>

        <div className="card seller-card">
          <div className="opacity-80" style={{ fontSize: 13, fontWeight: 600 }}>
            Chiffre d’affaires (global)
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 900,
              lineHeight: 1.1,
              marginTop: 6,
            }}
          >
            {statsQ.isLoading ? "…" : euros(statsQ.data?.revenueCents ?? 0)}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-2 mb-3">Commandes à préparer</h2>

      <div className="card seller-wrapper">
        {ordersQ.isLoading ? (
          <div className="text-sm">Chargement…</div>
        ) : !ordersQ.data || ordersQ.data.length === 0 ? (
          <div className="text-sm">
            Aucune commande à préparer pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {ordersQ.data.map((ov) => {
              const number = ov.order.order_number || ov.order.id.slice(0, 8);
              return (
                <div key={ov.order.id} className="rounded-2xl seller-order">
                  <div className="seller-order__head">
                    <div style={{ fontSize: 18, fontWeight: 800 }}>
                      Commande {number}
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      {statusBadge(ov.order.status)}
                      {payBadge(ov.order.payment_status)}
                      <span
                        className="opacity-80"
                        style={{ fontSize: 12, fontWeight: 600 }}
                      >
                        {fmtDate(ov.order.created_at)}
                      </span>
                    </div>
                  </div>

                  {ov.lines.length > 0 && (
                    <div className="overflow-auto" style={{ padding: 12 }}>
                      <table className="min-w-full seller-table">
                        <thead>
                          <tr>
                            <th className="p-3" style={{ width: 520 }}>
                              Article
                            </th>
                            <th className="p-3" style={{ width: 100 }}>
                              Taille
                            </th>
                            <th
                              className="p-3 text-right"
                              style={{ width: 80 }}
                            >
                              Qté
                            </th>
                            <th
                              className="p-3 text-right"
                              style={{ width: 140 }}
                            >
                              Montant
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {ov.lines.map((l, i) => {
                            const label =
                              l.variant?.name ??
                              l.variant?.sku ??
                              l.item.product_variant_id;
                            const size = l.variant?.size_eu ?? "—";
                            const amountCents =
                              Math.round(
                                (l.item.total_price ??
                                  l.item.unit_price * l.item.quantity) * 100
                              ) || 0;
                            return (
                              <tr key={i}>
                                <td className="p-3">
                                  <div title={label} className="ellipsis">
                                    {label}
                                  </div>
                                </td>
                                <td className="p-3">{size}</td>
                                <td className="p-3 text-right">
                                  x{l.item.quantity}
                                </td>
                                <td
                                  className="p-3 text-right"
                                  style={{ fontWeight: 700 }}
                                >
                                  {euros(amountCents)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="seller-total">
                    <div className="seller-total__pill">
                      Total: {euros(ov.totalCents)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
