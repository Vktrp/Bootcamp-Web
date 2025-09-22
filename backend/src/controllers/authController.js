// backend/src/controllers/authController.js

import jwt from "jsonwebtoken";

import bcrypt from "bcryptjs";

import pool from "../models/db.js"; // Pool PG centralisé

// Colonnes retournées côté API (address_line_1 -> address)

const USER_COLS = `

  id,

  email,

  role,

  first_name,

  last_name,

  address

 `;

/* ===================== Helpers ===================== */

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },

    process.env.JWT_SECRET,

    { expiresIn: "7d" }
  );
}

function toPublicUser(row) {
  return {
    id: String(row.id),

    email: row.email,

    role: row.role,

    first_name: row.first_name ?? null,

    last_name: row.last_name ?? null,

    address: row.address ?? null,
  };
}

/* ===================== Controllers ===================== */

// POST /auth/register

export async function register(req, res) {
  try {
    const { email, password, first_name, last_name } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const emailLower = String(email).trim().toLowerCase();

    // Email déjà pris ?

    const dup = await pool.query(
      "SELECT 1 FROM public.users WHERE lower(email) = $1 LIMIT 1",

      [emailLower]
    );

    if (dup.rows.length) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    // Hash bcrypt

    const salt = await bcrypt.genSalt(10);

    const hash = await bcrypt.hash(String(password), salt);

    await pool.query(
      `INSERT INTO public.users (email, password_hash, role, first_name, last_name)

       VALUES ($1, $2, $3, $4, $5)`,

      [emailLower, hash, "customer", first_name ?? null, last_name ?? null]
    );

    // Front fait ensuite un login → on renvoie juste ok

    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error("REGISTER 500:", e);

    return res.status(500).json({ message: "Erreur serveur." });
  }
}

// POST /auth/login

export async function login(req, res) {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const emailLower = String(email).trim().toLowerCase();

    const { rows } = await pool.query(
      `SELECT ${USER_COLS}, password_hash

         FROM public.users

        WHERE lower(email) = $1

        LIMIT 1`,

      [emailLower]
    );

    if (!rows.length) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe invalide." });
    }

    const row = rows[0];

    const allowPlain =
      String(process.env.ALLOW_PLAINTEXT_PASSWORDS || "") === "1";

    let ok = false;

    // Si la base contient des mots de passe non hashés et que tu l'autorises

    if (
      allowPlain &&
      row.password_hash &&
      !String(row.password_hash).startsWith("$2")
    ) {
      ok = String(password) === String(row.password_hash);
    } else {
      ok = await bcrypt.compare(String(password), row.password_hash || "");
    }

    if (!ok) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe invalide." });
    }

    const token = signToken({ id: row.id, role: row.role });

    const user = toPublicUser(row);

    return res.json({ token, user });
  } catch (e) {
    console.error("LOGIN 500:", e);

    return res.status(500).json({ message: "Erreur serveur." });
  }
}

// GET /auth/me  (protégé par le middleware d'auth)

export async function me(req, res) {
  try {
    const id = req.user?.id;

    if (!id) return res.status(401).json({ message: "Non autorisé." });

    const { rows } = await pool.query(
      `SELECT ${USER_COLS}

         FROM public.users

        WHERE id = $1

        LIMIT 1`,

      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    return res.json(toPublicUser(rows[0]));
  } catch (e) {
    console.error("ME 500:", e);

    return res.status(500).json({ message: "Erreur serveur." });
  }
}
