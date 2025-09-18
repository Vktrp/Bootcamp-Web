import { useEffect, useMemo, useState } from "react";
import { listUsers, type UserRow } from "./api";

function Badge({
  kind,
  children,
}: {
  kind: "ok" | "warn" | "error" | "info";
  children: React.ReactNode;
}) {
  const styles: Record<string, React.CSSProperties> = {
    ok: { background: "rgba(34,197,94,.12)", color: "rgb(34,197,94)" },
    warn: { background: "rgba(234,179,8,.12)", color: "rgb(234,179,8)" },
    error: { background: "rgba(239,68,68,.12)", color: "rgb(239,68,68)" },
    info: { background: "rgba(59,130,246,.12)", color: "rgb(59,130,246)" },
  };
  return (
    <span
      className="px-3 py-1 text-xs rounded-full"
      style={{
        ...styles[kind],
        border: "1px solid currentColor",
        borderColor: styles[kind].color as string,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function roleBadge(role?: string | null) {
  const r = (role ?? "").toLowerCase();
  if (r === "admin") return <Badge kind="info">admin</Badge>;
  if (r === "seller") return <Badge kind="warn">seller</Badge>;
  return <Badge kind="ok">customer</Badge>;
}
function activeBadge(active?: boolean | null) {
  return active ? (
    <Badge kind="ok">oui</Badge>
  ) : (
    <Badge kind="error">non</Badge>
  );
}
function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type SortKey = "created_at" | "email" | "role";

export default function UsersTable() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  // UI: recherche & tri
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("created_at");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    (async () => {
      const data = await listUsers(500, 0);
      setRows(data);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const base = qq
      ? rows.filter((u) => {
          const full = `${u.first_name ?? ""} ${
            u.last_name ?? ""
          }`.toLowerCase();
          return (
            u.email?.toLowerCase().includes(qq) ||
            full.includes(qq) ||
            (u.role ?? "").toLowerCase().includes(qq)
          );
        })
      : rows.slice();

    base.sort((a, b) => {
      const mul = dir === "asc" ? 1 : -1;
      if (sort === "created_at") {
        return (
          (new Date(a.created_at ?? 0).getTime() -
            new Date(b.created_at ?? 0).getTime()) *
          mul
        );
      }
      if (sort === "email") {
        return ((a.email ?? "") > (b.email ?? "") ? 1 : -1) * mul;
      }
      return ((a.role ?? "") > (b.role ?? "") ? 1 : -1) * mul;
    });

    return base;
  }, [rows, q, sort, dir]);

  if (loading) return <p className="container-page">Chargement…</p>;

  return (
    <div className="container-page" style={{ maxWidth: 1200 }}>
      <h1 className="text-2xl font-semibold mb-4">Utilisateurs</h1>

      {/* Barre d’outils aérée */}
      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}
      >
        <input
          className="input"
          placeholder="Rechercher (email, nom, rôle)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ minWidth: 320, height: 40, fontSize: 14 }}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            className="input"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            style={{ height: 40, fontSize: 14 }}
          >
            <option value="created_at">Créé le</option>
            <option value="email">Email</option>
            <option value="role">Rôle</option>
          </select>
          <button
            className="btn-outline"
            onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
            style={{ height: 40 }}
          >
            {dir === "asc" ? "↑" : "↓"}
          </button>
          <div className="text-sm opacity-70">
            {filtered.length} résultat(s)
          </div>
        </div>
      </div>

      {/* Table lisible avec grands espacements */}
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
              <th className="p-4">ID</th>
              <th className="p-4" style={{ width: 300 }}>
                Email
              </th>
              <th className="p-4" style={{ width: 260 }}>
                Nom
              </th>
              <th className="p-4" style={{ width: 140 }}>
                Rôle
              </th>
              <th className="p-4" style={{ width: 120 }}>
                Actif
              </th>
              <th className="p-4" style={{ width: 200 }}>
                Créé le
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr
                key={u.id}
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
                  {u.id}
                </td>
                <td className="p-4" style={{ maxWidth: 300 }}>
                  <div
                    title={u.email ?? ""}
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {u.email ?? "—"}
                  </div>
                </td>
                <td className="p-4" style={{ maxWidth: 260 }}>
                  <div
                    title={`${u.first_name ?? ""} ${u.last_name ?? ""}`}
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {(u.first_name ?? "—") + " " + (u.last_name ?? "")}
                  </div>
                </td>
                <td className="p-4">{roleBadge(u.role)}</td>
                <td className="p-4">{activeBadge(u.is_active)}</td>
                <td className="p-4">{fmtDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="muted mt-3">
          Aucun utilisateur ne correspond à ta recherche.
        </div>
      )}
    </div>
  );
}
