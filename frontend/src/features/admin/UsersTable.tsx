// src/features/admin/UsersTable.tsx

 import { useQuery, useQueryClient } from "@tanstack/react-query";

 import { useMemo, useState } from "react";

 import {

  listUsers,

  updateUserRole,

  setUserActive,

  type UserRow,

 } from "./api";

 type Role = "admin" | "seller" | "customer";

 function StatusBadge({ active }: { active: boolean }) {

  const kind = active ? "ok" : "error";

  const label = active ? "Actif" : "Inactif";

  const palette: Record<string, { bg: string; fg: string }> = {

    ok: { bg: "rgba(34,197,94,.18)", fg: "rgb(34,197,94)" },

    error: { bg: "rgba(239,68,68,.20)", fg: "rgb(239,68,68)" },

  };

  return (
<span

      style={{

        background: palette[kind].bg,

        color: palette[kind].fg,

        padding: "4px 8px",

        fontSize: 12,

        borderRadius: 8,

        fontWeight: 800,

        lineHeight: 1,

        whiteSpace: "nowrap",

        display: "inline-block",

      }}
>

      {label}
</span>

  );

 }

 function fmtDate(iso?: string | null) {

  if (!iso) return "—";

  const d = new Date(iso);

  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });

 }

 export default function UsersTable() {

  const qc = useQueryClient();

  const [limit] = useState(50);

  const [offset] = useState(0);

  const { data = [], isLoading, error } = useQuery<UserRow[]>({

    queryKey: ["admin-users", { limit, offset }],

    queryFn: () => listUsers(limit, offset),

    initialData: [],

  });

  // état local d'édition par ligne

  type Draft = { role: Role; is_active: boolean; dirty: boolean; saving?: boolean; error?: string | null };

  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const rows = useMemo(() => data, [data]);


  // types de rappel

 type Role = "admin" | "seller" | "customer";


 // -----------------------------

 // Remplace ta fonction setDraft

 // -----------------------------

 const setDraft = (id: string, patch: Partial<Draft>) =>

  setDrafts((prev) => {

    // point de départ = brouillon existant OU valeurs par défaut

    const base: Draft = prev[id]

      ? prev[id]

      : {

          role: "customer",

          is_active: false,

          dirty: false,

        };

    // IMPORTANT : un seul objet, un seul 'dirty'

    return {

      ...prev,

      [id]: {

        ...base,        // garde l’existant s’il y en a

        ...patch,       // applique les modifs passées à setDraft(...)

        dirty: true,    // marque la ligne comme modifiée

      },

    };

  });

 // -------------------------------------------------------

 // Optionnel mais conseillé : sécurise startDraftIfNeeded

 // -------------------------------------------------------

 const startDraftIfNeeded = (u: UserRow) =>

  setDrafts((prev) =>

    prev[u.id]

      ? prev

      : {

          ...prev,

          [u.id]: {

            role: (u.role ?? "customer") as Role,

            is_active: !!u.is_active,

            dirty: false,

          },

        }

  );
  
  const onChangeRole = (u: UserRow, role: Role) => {

    startDraftIfNeeded(u);

    setDraft(u.id, { role });

  };

  const onToggleActive = (u: UserRow, next: boolean) => {

    startDraftIfNeeded(u);

    setDraft(u.id, { is_active: next });

  };

  const onSave = async (u: UserRow) => {

    const d = drafts[u.id];

    if (!d || (!d.dirty && d.saving === false)) return;

    setDraft(u.id, { saving: true, error: null });

    try {

      // applique seulement ce qui change

      if (d.role !== (u.role ?? "customer")) {

        await updateUserRole(u.id, d.role);

      }

      if (Boolean(d.is_active) !== Boolean(u.is_active)) {

        await setUserActive(u.id, d.is_active);

      }

      await qc.invalidateQueries({ queryKey: ["admin-users"] });

      setDrafts((prev) => ({ ...prev, [u.id]: { ...prev[u.id], dirty: false, saving: false } as Draft }));

    } catch (e: any) {

      setDrafts((prev) => ({ ...prev, [u.id]: { ...prev[u.id], saving: false, error: e?.message || "Erreur" } as Draft }));

    }

  };

  return (
<div className="container-page admin-page" style={{ maxWidth: 1100 }}>
<style>{`

        .admin-table { font-variant-numeric: tabular-nums; width: 100%; border-collapse: separate; border-spacing: 0; }

        .admin-table thead th {

          font-weight: 700; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,.08); text-align: left;

        }

        .admin-table tbody td {

          padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,.05); vertical-align: middle;

        }

        .admin-table tbody tr:last-child td { border-bottom: 0; }

        .table-frame { border-radius: 14px; overflow: auto; }

        .role-select { min-width: 150px; }

        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }

        .switch input { opacity: 0; width: 0; height: 0; }

        .slider { position: absolute; cursor: pointer; inset: 0; background: #e5e7eb; border-radius: 999px; transition: .2s; }

        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; top: 3px; background: white; border-radius: 50%; transition: .2s; box-shadow: 0 1px 3px rgba(0,0,0,.2); }

        input:checked + .slider { background: #22c55e; }

        input:checked + .slider:before { transform: translateX(20px); }

        .save-btn { font-weight: 700; }

        .error { color: #c1121f; font-size: 12px; margin-top: 4px; }

      `}</style>
<h1 className="text-xl font-semibold mb-3">Utilisateurs</h1>

      {isLoading && <div className="card p-4">Chargement…</div>}

      {error && <div className="card p-4 text-danger">Erreur de chargement.</div>}

      {!isLoading && !error && (
<div className="card admin-wrapper" style={{ marginTop: 6 }}>

          {rows.length === 0 ? (
<div className="muted">Aucun utilisateur.</div>

          ) : (
<div className="table-frame">
<table className="admin-table">
<colgroup>
<col style={{ width: 260 }} />
<col style={{ width: 160 }} />
<col style={{ width: 140 }} />
<col style={{ width: 120 }} />
<col style={{ width: 160 }} />
<col style={{ width: 140 }} />
</colgroup>
<thead>
<tr>
<th>Email</th>
<th>Nom</th>
<th>Rôle</th>
<th>Actif</th>
<th>Créé le</th>
<th style={{ textAlign: "right" }}>Actions</th>
</tr>
</thead>
<tbody>

                  {rows.map((u) => {

                    const d = drafts[u.id] ?? {

                      role: (u.role ?? "customer") as Role,

                      is_active: !!u.is_active,

                      dirty: false,

                    };

                    const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || "—";

                    const dirty =

                      d.dirty &&

                      (d.role !== (u.role ?? "customer") || Boolean(d.is_active) !== Boolean(u.is_active));

                    return (
<tr key={u.id}>
<td className="font-mono">{u.email || "—"}</td>
<td>{name}</td>
<td>
<select

                            className="input role-select"

                            value={d.role}

                            onChange={(e) => onChangeRole(u, e.target.value as Role)}
>
<option value="customer">customer</option>
<option value="seller">seller</option>
<option value="admin">admin</option>
</select>
</td>
<td>
<label className="switch" title={d.is_active ? "Actif" : "Inactif"}>
<input

                              type="checkbox"

                              checked={d.is_active}

                              onChange={(e) => onToggleActive(u, e.target.checked)}

                            />
<span className="slider" />
</label>
<div className="mt-1">
<StatusBadge active={d.is_active} />
</div>
</td>
<td>{fmtDate(u.created_at)}</td>
<td style={{ textAlign: "right" }}>
<button

                            className="btn save-btn"

                            disabled={!dirty || d.saving}

                            onClick={() => onSave(u)}
>

                            {d.saving ? "Enregistrement…" : "Enregistrer"}
</button>

                          {d.error && <div className="error">{d.error}</div>}
</td>
</tr>

                    );

                  })}
</tbody>
</table>
</div>

          )}
</div>

      )}
</div>

  );

 }