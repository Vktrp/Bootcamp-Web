import { useEffect, useState } from "react";
import { API_URL } from "../../lib/utils";

type Row = { sku: string; sizeEU: number; stock: number; productName: string };

export default function StockTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await fetch(`${API_URL}/api/products?limit=200`);
      const j = await r.json();
      const flat: Row[] = j.items.flatMap((p: any) =>
        p.variants.map((v: any) => ({
          sku: v.sku,
          sizeEU: v.sizeEU,
          stock: v.stock,
          productName: p.name,
        }))
      );
      setRows(flat);
      setLoading(false);
    })();
  }, []);

  async function adjust(sku: string, delta: number) {
    const r = await fetch(`${API_URL}/api/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ sku, delta }]),
    });
    if (r.ok)
      setRows((rs) =>
        rs.map((x) => (x.sku === sku ? { ...x, stock: x.stock + delta } : x))
      );
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Stock par SKU</h2>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-2">SKU</th>
              <th className="text-left p-2">Produit</th>
              <th className="text-right p-2">Pointure</th>
              <th className="text-right p-2">Stock</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sku} className="border-t">
                <td className="p-2 font-mono">{r.sku}</td>
                <td className="p-2">{r.productName}</td>
                <td className="p-2 text-right">{r.sizeEU}</td>
                <td className="p-2 text-right">{r.stock}</td>
                <td className="p-2 flex gap-2">
                  <button
                    className="btn-outline"
                    onClick={() => adjust(r.sku, -1)}
                  >
                    -1
                  </button>
                  <button className="btn" onClick={() => adjust(r.sku, +1)}>
                    +1
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
