import { useEffect, useMemo, useState } from "react";
import {
  listStock,
  adjustInventory,
  countVariants,
  type StockRow,
} from "./api";

const PAGE_SIZE = 50;

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

  if (loading) return <p className="container-page">Chargement…</p>;

  // alignements cohérents
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
      <style>{`
        .admin-table { font-variant-numeric: tabular-nums; }
        .admin-table thead th {
          font-weight: 700; padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .admin-table tbody td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,.05);
        }
        .admin-table tbody tr:last-child td { border-bottom: 0; }
        .admin-table th, .admin-table td { white-space: nowrap; }
        .qty-pill {
          padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 800;
          background: rgba(59,130,246,.12); color: rgb(191,219,254);
          border: 1px solid rgba(59,130,246,.55);
        }
        .action-pill {
          min-width: 44px; height: 32px; border-radius: 999px;
          display: inline-flex; align-items: center; justify-content: center;
          padding: 0 12px;
        }
        .action-minus { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); }
        .action-plus  { background: rgba(59,130,246,.15); border: 1px solid rgba(59,130,246,.45); }
      `}</style>

      <h1 className="text-2xl font-semibold mb-2">Stock par variante</h1>

      {/* Toolbar */}
      <div
        className="card"
        style={{
          padding: 12,
          marginBottom: 12,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
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

      {/* Tableau */}
      <div className="card admin-wrapper">
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
              {/* Largeurs fixes et régulières */}
              <colgroup>
                <col style={{ width: 360 }} /> {/* Variant ID (long) */}
                <col style={{ width: 160 }} /> {/* SKU */}
                <col style={{ width: 420 }} /> {/* Produit */}
                <col style={{ width: 110 }} /> {/* Pointure */}
                <col style={{ width: 110 }} /> {/* Stock */}
                <col style={{ width: 160 }} /> {/* Actions */}
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
                {filtered.map((r, i) => (
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
        </div>
      </div>

      {/* Pagination */}
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
