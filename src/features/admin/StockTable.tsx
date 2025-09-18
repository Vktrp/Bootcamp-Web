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

  return (
    <div className="container-page" style={{ maxWidth: 1200 }}>
      <h1 className="text-2xl font-semibold mb-2">Stock par variante</h1>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2">
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

      <div
        className="overflow-auto rounded-2xl"
        style={{ border: "1px solid rgba(255,255,255,.08)" }}
      >
        <table
          className="min-w-full"
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              background: "rgba(255,255,255,.04)",
              backdropFilter: "blur(4px)",
            }}
          >
            <tr style={{ textAlign: "left" }}>
              <th className="p-4">Variant ID</th>
              <th className="p-4" style={{ width: 140 }}>
                SKU
              </th>
              <th className="p-4" style={{ width: 520 }}>
                Produit
              </th>
              <th className="p-4 text-right" style={{ width: 100 }}>
                Pointure
              </th>
              <th className="p-4 text-right" style={{ width: 100 }}>
                Stock
              </th>
              <th className="p-4" style={{ width: 140 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr
                key={r.variant_id}
                style={{
                  background:
                    i % 2 === 0 ? "rgba(255,255,255,.02)" : "transparent",
                  borderTop: "1px solid rgba(255,255,255,.06)",
                }}
                className="hover:bg-white/5 transition-colors"
              >
                <td
                  className="p-4 font-mono opacity-80"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {r.variant_id}
                </td>
                <td className="p-4 font-mono" style={{ maxWidth: 140 }}>
                  <div
                    title={r.sku ?? ""}
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.sku ?? "—"}
                  </div>
                </td>
                <td className="p-4" style={{ maxWidth: 520 }}>
                  <div
                    title={r.name ?? ""}
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.name ?? "—"}
                  </div>
                </td>
                <td className="p-4 text-right">{r.size_eu ?? "—"}</td>
                <td className="p-4 text-right">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{
                      background: "rgba(59,130,246,.12)",
                      color: "rgb(59,130,246)",
                      border: "1px solid rgb(59,130,246)",
                    }}
                  >
                    {r.stock}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="btn-outline"
                      onClick={() => adjust(r.variant_id, -1)}
                    >
                      -1
                    </button>
                    <button
                      className="btn"
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
                <td className="p-6 text-center muted" colSpan={6}>
                  Aucun résultat pour « {q} ».
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
