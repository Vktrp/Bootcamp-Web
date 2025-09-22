// src/controllers/adminUsersController.js

 import pool from "../models/db.js";

 // GET /admin/users?limit=&offset=

 export async function listUsers(req, res) {

  try {

    const limit = Number(req.query.limit || 50);

    const offset = Number(req.query.offset || 0);

    const { rows } = await pool.query(

      `select id, email, first_name, last_name, role, is_active, created_at

       from public.users

       order by created_at desc

       limit $1 offset $2`,

      [limit, offset]

    );

    res.json(rows);

  } catch (e) {

    console.error("[admin] listUsers error:", e);

    res.status(500).json({ message: "Server error" });

  }

 }

 // PATCH /admin/users/:id/role  { role: "admin"|"seller"|"customer" }

 export async function updateUserRole(req, res) {

  try {

    const { id } = req.params;

    const { role } = req.body;

    const roles = ["admin", "seller", "customer"];

    if (!roles.includes(String(role))) {

      return res.status(400).json({ message: "Invalid role" });

    }

    const { rows } = await pool.query(

      `update public.users

         set role = $1, updated_at = now()

       where id = $2

       returning id, email, first_name, last_name, role, is_active, created_at`,

      [role, id]

    );

    if (!rows.length) return res.status(404).json({ message: "User not found" });

    res.json(rows[0]);

  } catch (e) {

    console.error("[admin] updateUserRole error:", e);

    res.status(500).json({ message: "Server error" });

  }

 }

 // PATCH /admin/users/:id/active  { is_active: true|false }

 export async function setUserActive(req, res) {

  try {

    const { id } = req.params;

    const { is_active } = req.body;

    const { rows } = await pool.query(

      `update public.users

         set is_active = $1, updated_at = now()

       where id = $2

       returning id, email, first_name, last_name, role, is_active, created_at`,

      [!!is_active, id]

    );

    if (!rows.length) return res.status(404).json({ message: "User not found" });

    res.json(rows[0]);

  } catch (e) {

    console.error("[admin] setUserActive error:", e);

    res.status(500).json({ message: "Server error" });

  }

 }