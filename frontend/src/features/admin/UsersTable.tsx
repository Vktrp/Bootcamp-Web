import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { listUsers, updateUser, type Role, type UserRow } from "./api";

/* UI bits */

function Badge({
  kind,

  children,
}: {
  kind: "ok" | "warn" | "error" | "info";

  children: React.ReactNode;
}) {
  const palette: Record<string, { bg: string; fg: string }> = {
    ok: { bg: "rgba(34,197,94,.18)", fg: "rgb(187,247,208)" },

    warn: { bg: "rgba(234,179,8,.22)", fg: "rgb(253,230,138)" },

    error: { bg: "rgba(239,68,68,.20)", fg: "rgb(254,202,202)" },

    info: { bg: "rgba(59,130,246,.20)", fg: "rgb(191,219,254)" },
  };

  return (
    <span
      style={{
        background: palette[kind].bg,

        color: palette[kind].fg,

        padding: "4px 9px",

        fontSize: 12,

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

function fmtDate(iso?: string | null) {
  if (!iso) return "—";

  const d = new Date(iso);

  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const ROLE_OPTIONS: Role[] = ["admin", "seller", "customer"];

function Switch({
  checked,

  onChange,
}: {
  checked: boolean;

  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      style={{
        width: 56,

        height: 30,

        borderRadius: 999,

        background: checked ? "rgba(34,197,94,.35)" : "rgba(148,163,184,.25)",

        border: "1px solid rgba(255,255,255,.15)",

        display: "inline-flex",

        alignItems: "center",

        padding: 3,

        transition: "all .15s ease",
      }}
    >
      <span
        style={{
          width: 24,

          height: 24,

          borderRadius: "50%",

          background: "rgba(255,255,255,.9)",

          transform: `translateX(${checked ? 26 : 0}px)`,

          transition: "transform .15s ease",
        }}
      />
    </button>
  );
}

/* Back */

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

        marginLeft: "calc(60% - 50vw)",

        paddingLeft: 12,
      }}
    >
      <button className="btn-outline" onClick={() => navigate(-1)}>
        ← Retour
      </button>
    </div>
  );
}

/* Draft typed with Role (not string) */

type Draft = { role?: Role; is_active?: boolean; dirty?: boolean };

export default function UsersTable() {
  const qc = useQueryClient();

  const key = ["admin-users"];

  const { data = [], isFetching } = useQuery({
    queryKey: key,

    queryFn: () => listUsers(200, 0),
  });

  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const value = <K extends keyof Draft | keyof UserRow>(u: UserRow, k: K) =>
    (drafts[String(u.id)] as any)?.[k] ?? (u as any)[k];

  const setDraft = (id: string | number, patch: Partial<Draft>) =>
    setDrafts((prev) => ({
      ...prev,

      [String(id)]: { ...(prev[String(id)] ?? {}), ...patch, dirty: true },
    }));

  const hasChanges = (u: UserRow) => {
    const d = drafts[String(u.id)];

    if (!d) return false;

    const currentRole = ((u.role as Role | null) ?? "customer") as Role;

    const changedRole = d.role !== undefined && d.role !== currentRole;

    const changedActive =
      d.is_active !== undefined && d.is_active !== !!u.is_active;

    return !!d.dirty && (changedRole || changedActive);
  };

  const saveOne = async (u: UserRow) => {
    if (!hasChanges(u)) return;

    setSaving((s) => ({ ...s, [String(u.id)]: true }));

    // Build payload

    const d = drafts[String(u.id)] ?? {};

    const currentRole = ((u.role as Role | null) ?? "customer") as Role;

    const payload: Partial<{ role: Role; is_active: boolean }> = {};

    if (d.role !== undefined && d.role !== currentRole)
      payload.role = d.role as Role;

    if (d.is_active !== undefined && d.is_active !== !!u.is_active)
      payload.is_active = d.is_active!;

    // Optimistic update

    const prev = qc.getQueryData<UserRow[]>(key) || [];

    const snapshot = [...prev];

    qc.setQueryData<UserRow[]>(key, (old = []) =>
      old.map((row) =>
        String(row.id) === String(u.id) ? { ...row, ...payload } : row
      )
    );

    try {
      await updateUser(u.id, payload);

      await qc.invalidateQueries({ queryKey: key });

      setDrafts((p) => {
        const n = { ...p };

        delete n[String(u.id)];

        return n;
      });
    } catch (e: any) {
      // rollback

      qc.setQueryData<UserRow[]>(key, snapshot);

      console.error(e);

      alert(e?.message || "Échec de l’enregistrement");
    } finally {
      setSaving((s) => ({ ...s, [String(u.id)]: false }));
    }
  };

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
      <BackBar />
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

        .role-select {

          background: rgba(255,255,255,.04);

          border: 1px solid rgba(255,255,255,.12);

          color: #fff;

          padding: 6px 10px;

          border-radius: 10px;

        }

      `}</style>
      <div className="card admin-wrapper" style={{ marginTop: 6 }}>
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
                <col style={{ width: 260 }} />
                <col style={{ width: 160 }} />
                <col style={{ width: 160 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: 120 }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={thLeft}>Nom</th>
                  <th style={thLeft}>Rôle</th>
                  <th style={thLeft}>Actif</th>
                  <th style={thLeft}>Créé le</th>
                  <th style={thRight}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isFetching && (
                  <tr>
                    <td colSpan={5} className="muted" style={{ padding: 18 }}>
                      Chargement…
                    </td>
                  </tr>
                )}

                {!isFetching && data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="muted" style={{ padding: 18 }}>
                      Aucun utilisateur.
                    </td>
                  </tr>
                )}

                {data.map((u) => {
                  const fullName =
                    [u.first_name, u.last_name].filter(Boolean).join(" ") ||
                    "—";

                  const active = !!value(u, "is_active");

                  const role = ((value(u, "role") as string) ||
                    "customer") as Role;

                  const dirty = hasChanges(u);

                  const isSaving = !!saving[String(u.id)];

                  return (
                    <tr key={String(u.id)}>
                      <td style={tdLeft}>
                        <div className="font-semibold">{fullName}</div>
                        <div className="opacity-70" style={{ fontSize: 12 }}>
                          {u.email ?? "—"}
                        </div>
                      </td>
                      <td style={tdLeft}>
                        <select
                          className="role-select"
                          value={role}
                          onChange={(e) =>
                            setDraft(u.id, { role: e.target.value as Role })
                          }
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={tdLeft}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <Badge kind={active ? "ok" : "warn"}>
                            {active ? "Actif" : "Inactif"}
                          </Badge>
                          <Switch
                            checked={active}
                            onChange={(next) =>
                              setDraft(u.id, { is_active: next })
                            }
                          />
                        </div>
                      </td>
                      <td style={tdLeft}>{fmtDate(u.created_at)}</td>
                      <td style={tdRight}>
                        <button
                          className="btn"
                          disabled={!dirty || isSaving}
                          onClick={() => saveOne(u)}
                        >
                          {isSaving ? "Enregistrement…" : "Enregistrer"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
