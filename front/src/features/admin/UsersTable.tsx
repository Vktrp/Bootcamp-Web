import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listUsers, type UserRow } from "./api";

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

/* ───── Badges ───── */
function Badge({
  kind,
  children,
}: {
  kind: "ok" | "warn" | "error" | "info";
  children: React.ReactNode;
}) {
  const styles: Record<string, React.CSSProperties> = {
    ok: { background: "rgba(34,197,94,.18)", color: "rgb(187,247,208)" },
    warn: { background: "rgba(234,179,8,.22)", color: "rgb(253,230,138)" },
    error: { background: "rgba(239,68,68,.20)", color: "rgb(254,202,202)" },
    info: { background: "rgba(59,130,246,.20)", color: "rgb(191,219,254)" },
  };
  return (
    <span
      style={{
        ...styles[kind],
        padding: "3px 8px",
        fontSize: 11,
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
const roleBadge = (role?: string | null) => {
  const r = (role ?? "").toLowerCase();
  if (r === "admin") return <Badge kind="info">admin</Badge>;
  if (r === "seller") return <Badge kind="warn">seller</Badge>;
  return <Badge kind="ok">customer</Badge>;
};
const activeBadge = (active?: boolean | null) =>
  active ? <Badge kind="ok">oui</Badge> : <Badge kind="error">non</Badge>;

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

  if (loading)
    return (
      <div className="container-page">
        <BackBar />
        Chargement…
      </div>
    );

  const thLeft = { textAlign: "left" as const };
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
  const thCenter = { textAlign: "center" as const };

  return (
    <div className="container-page" style={{ maxWidth: 1200 }}>
      <BackBar />
      <style>{`
        .admin-table { font-variant-numeric: tabular-nums; }
        .admin-table thead th { font-weight: 700; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,.08); }
        .admin-table tbody td { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,.05); }
        .admin-table tbody tr:last-child td { border-bottom: 0; }
        .admin-table th, .admin-table td { white-space: nowrap; }
        .users-toolbar { padding: 16px; margin-bottom: 16px; display:flex; flex-wrap:wrap; gap:12px; align-items:center; }
        .table-frame { border-radius: 14px; }
      `}</style>

      <h1 className="text-2xl font-semibold mb-4">Utilisateurs</h1>

      <div className="card users-toolbar">
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
            aria-label="Inverser l'ordre"
          >
            {dir === "asc" ? "↑" : "↓"}
          </button>
          <div className="text-sm opacity-70">
            {filtered.length} résultat(s)
          </div>
        </div>
      </div>

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
              <colgroup>
                <col style={{ width: 80 }} />
                <col style={{ width: 250 }} />
                <col style={{ width: 180 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: 110 }} />
                <col style={{ width: 180 }} />
              </colgroup>

              <thead>
                <tr>
                  <th style={thLeft}>ID</th>
                  <th style={thLeft}>Email</th>
                  <th style={thLeft}>Nom</th>
                  <th style={thCenter}>Rôle</th>
                  <th style={thCenter}>Actif</th>
                  <th style={thRight}>Créé le</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="font-mono opacity-80" style={tdLeft}>
                      {u.id}
                    </td>
                    <td style={tdLeft}>
                      <div
                        title={u.email ?? ""}
                        style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {u.email ?? "—"}
                      </div>
                    </td>
                    <td style={tdLeft}>
                      <div
                        title={`${u.first_name ?? ""} ${u.last_name ?? ""}`}
                        style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {(u.first_name ?? "—") + " " + (u.last_name ?? "")}
                      </div>
                    </td>
                    <td style={tdCenter}>{roleBadge(u.role)}</td>
                    <td style={tdCenter}>{activeBadge(u.is_active)}</td>
                    <td style={tdRight}>{fmtDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="muted mt-3">
            Aucun utilisateur ne correspond à ta recherche.
          </div>
        )}
      </div>
    </div>
  );
}
