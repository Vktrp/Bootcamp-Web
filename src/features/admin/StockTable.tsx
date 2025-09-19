import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listStock,
  adjustInventory,
  countVariants,
  type StockRow,
} from "./api";

const PAGE_SIZE = 50;

// ── Bouton Retour ────────────────────────────────────────────────────────────
function BackBar() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        position: "sticky",
        top: 55,
        zIndex: 40,
        margin: "8px 0 12px",
        width: "15vw",
        marginLeft: "calc(50% - 50vw)",
        paddingLeft: 12,
      }}
    >
      <button className="btn-outline" onClick={() => navigate(-1)}>
        ← Retour
      </button>
    </div>
  );
}

export default function StockTable() {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");

  const offset = useMemo(() => (page - 1) * PAGE_SIZE, [page]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [cnt, pageRows] = await Promise.all([
        countVariants(),
        listStock(PAGE_SIZE, offset),
      ]);
      setTotal(cnt);
      setRows(pageRows);
      setLoading(false);
    })();
  }, [offset]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((r) => {
      const inSku = (r.sku ?? "").toLowerCase().includes(qq);
      const inName = (r.name ?? "").toLowerCase().includes(qq);
      const inSize = (r.size_eu ?? "").toString().includes(qq);
      const inId = (r.variant_id ?? "").toLowerCase().includes(qq);
      return inSku || inName || inSize || inId;
    });
  }, [rows, q]);

  async function adjust(variant_id: string, delta: number) {
    const next = await adjustInventory(variant_id, delta);
    setRows((rs) =>
      rs.map((r) => (r.variant_id === variant_id ? { ...r, stock: next } : r))
    );
  }

  if (loading)
    return (
      <div className="container-page">
        <BackBar />
        Chargement…
      </div>
    );

  const thLeft = { textAlign: "left" as const };
  const thCenter = { textAlign: "center" as const };
  const thRight = { textAlign: "right" as const };
  const tdLeft = {
    textAlign: "left" as const,
    verticalAlign: "middle" as const,
  };
  const tdCenter = {
    textAlign: "center" as const,
    verticalAlign: "middle" as const,
  };
  const tdRight = {
    textAlign: "right" as const,
    verticalAlign: "middle" as const,
  };

  return (
    <div className="container-page" style={{ maxWidth: 1200 }}>
      <BackBar />
      <style>{`
        .admin-table { font-variant-numeric: tabular-nums; }
        .admin-table thead th { font-weight:700; padding:12px 16px; border-bottom:1px solid rgba(255,255,255,.08); }
        .admin-table tbody td { padding:12px 16px; border-bottom:1px solid rgba(255,255,255,.05); }
        .admin-table tbody tr:last-child td { border-bottom:0; }
        .admin-table th, .admin-table td { white-space: nowrap; }
        .qty-pill { padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 800; background: rgba(59,130,246,.12); color: rgb(191,219,254); border: 1px solid rgba(59,130,246,.45); }
        .action-pill { min-width: 44px; height: 32px; border-radius: 999px; display: inline-flex; align-items:center; justify-content:center; padding:0 12px; color: rgba(255,255,255,.92); font-weight: 800; }
        .action-minus { background: rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.28); }
        .action-minus:hover { background: rgba(255,255,255,.18); border-color: rgba(255,255,255,.35); }
        .action-plus  { background: rgba(59,130,246,.22); border:1px solid rgba(59,130,246,.55); color: rgba(255,255,255,.96); }
        .action-plus:hover { background: rgba(59,130,246,.30); }
        .toolbar { padding:12px; margin-bottom:12px; display:flex; gap:12px; align-items:center; }
        @media (prefers-color-scheme: light) {
          .admin-table thead th { border-bottom: 1px solid rgba(0,0,0,.08); }
          .admin-table tbody td { border-bottom: 1px solid rgba(0,0,0,.06); }
          .qty-pill { background: rgba(37, 99, 235, .14); border: 1px solid rgba(37, 99, 235, .35); color: #1d4ed8; }
          .action-pill { color: #111; }
          .action-minus { background: rgba(0,0,0,.08); border: 1px solid rgba(0,0,0,.20); color: #111; }
          .action-minus:hover { background: rgba(0,0,0,.12); border-color: rgba(0,0,0,.26); }
          .action-plus { background: rgba(37, 99, 235, .18); border: 1px solid rgba(37, 99, 235, .40); color: #0b3ecf; }
          .action-plus:hover { background: rgba(37, 99, 235, .26); }
        }
      `}</style>

      <h1 className="text-2xl font-semibold mb-2">Stock par variante</h1>

      <div className="card toolbar">
        <div className="text-sm opacity-70">
          {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} / {total}
        </div>
        <input
          className="input"
          placeholder="Rechercher (SKU, produit, pointure, ID)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ minWidth: 320, height: 40 }}
        />
      </div>

      <div className="card admin-wrapper" style={{ overflowX: "auto" }}>
        <table
          className="min-w-full admin-table"
          style={{
            tableLayout: "fixed",
            width: "100%",
            minWidth: 1120,
            fontSize: "clamp(12px, 1.4vw, 14px)",
            lineHeight: 1.5,
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <colgroup>
            <col style={{ width: 320 }} />
            <col style={{ width: 150 }} />
            <col style={{ width: 420 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 170 }} />
          </colgroup>

          <thead
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              background: "rgba(255,255,255,.04)",
              backdropFilter: "blur(4px)",
            }}
          >
            <tr>
              <th style={thLeft}>Variant ID</th>
              <th style={thLeft}>SKU</th>
              <th style={thLeft}>Produit</th>
              <th style={thRight}>Pointure</th>
              <th style={thCenter}>Stock</th>
              <th style={thCenter}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.variant_id}
                className="hover:bg-white/5 transition-colors"
              >
                <td style={tdLeft} className="font-mono opacity-80">
                  {r.variant_id}
                </td>
                <td style={tdLeft} className="font-mono">
                  <div
                    title={r.sku ?? ""}
                    style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {r.sku ?? "—"}
                  </div>
                </td>
                <td style={tdLeft}>
                  <div
                    title={r.name ?? ""}
                    style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {r.name ?? "—"}
                  </div>
                </td>
                <td style={tdRight}>{r.size_eu ?? "—"}</td>
                <td style={tdCenter}>
                  <span className="qty-pill">{r.stock}</span>
                </td>
                <td style={tdCenter}>
                  <div style={{ display: "inline-flex", gap: 8 }}>
                    <button
                      className="action-pill action-minus"
                      onClick={() => adjust(r.variant_id, -1)}
                    >
                      -1
                    </button>
                    <button
                      className="action-pill action-plus"
                      onClick={() => adjust(r.variant_id, +1)}
                    >
                      +1
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center muted">
                  Aucun résultat pour « {q} ».
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 items-center justify-end mt-3">
        <button
          className="btn-outline"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ← Précédent
        </button>
        <div className="text-sm">
          Page {page} / {totalPages}
        </div>
        <button
          className="btn-outline"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
