import pool from "../db.js";

/** GET /admin/users */

export async function listUsers(req, res) {
  try {
    const { rows } = await pool.query(
      `select id, email, first_name, last_name, role, is_active, created_at

       from users

       order by created_at desc

       limit 200`
    );

    res.json(rows);
  } catch (e) {
    console.error("listUsers error:", e);

    res.status(500).json({ message: "Erreur serveur." });
  }
}

/** PATCH /admin/users/:id  body: { role?, is_active? } */

export async function updateUser(req, res) {
  try {
    const id = req.params.id;

    const { role, is_active } = req.body ?? {};

    const sets = [];

    const vals = [];

    let i = 1;

    if (typeof role === "string") {
      sets.push(`role=$${i++}`);
      vals.push(role);
    }

    if (typeof is_active === "boolean") {
      sets.push(`is_active=$${i++}`);
      vals.push(is_active);
    }

    if (sets.length === 0)
      return res.status(400).json({ message: "Nothing to update" });

    vals.push(id);

    const { rows } = await pool.query(
      `update users set ${sets.join(", ")}, updated_at = now()

       where id = $${i}

       returning id, email, first_name, last_name, role, is_active, created_at`,

      vals
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Not found" });

    res.json(rows[0]);
  } catch (e) {
    console.error("updateUser error:", e);

    res.status(500).json({ message: "Erreur serveur." });
  }
}
