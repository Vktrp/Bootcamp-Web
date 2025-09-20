// backend/src/controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? "")
    ? false
    : { rejectUnauthorized: false },
});

/* ======================= UTIL ======================= */

async function getUsersColumns(client) {
  const q = `
    select column_name
    from information_schema.columns
    where table_schema = 'public' and table_name = 'users'
  `;
  const { rows } = await client.query(q);
  return new Set(rows.map((r) => r.column_name));
}

function buildUserSelect(cols, { withPassword = false } = {}) {
  const base = ["id", "email"];
  base.push(cols.has("first_name") ? `"first_name"` : `null as "first_name"`);
  base.push(cols.has("last_name") ? `"last_name"` : `null as "last_name"`);
  base.push(cols.has("role") ? `"role"` : `null as "role"`);
  if (withPassword) base.push(`"password_hash"`);
  return `select ${base.join(", ")} from public.users`;
}

function assertJwtSecret() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET manquant");
  return process.env.JWT_SECRET;
}

function makeToken(user) {
  const secret = assertJwtSecret();
  return jwt.sign({ id: user.id, role: user.role ?? null }, secret, {
    expiresIn: "7d",
  });
}

// Nettoie padding/retours/espaces (problèmes fréquents après copier/coller)
// NE PAS supprimer les espaces internes !
// On retire juste les null-bytes et les fins de ligne/padding à droite.
function normalizeHash(h) {
  if (typeof h !== "string") return undefined;
  // retire null bytes en fin (si colonne CHAR)
  let s = h.replace(/\u0000+$/g, "");
  // retire uniquement CR/LF finaux (collage supabase)
  s = s.replace(/[\r\n]+$/g, "");
  // ne pas toucher aux espaces internes; juste trimEnd() pour padding à droite
  return s.trimEnd();
}

async function comparePassword(input, storedRaw) {
  const stored = normalizeHash(storedRaw);

  // Cas bcrypt ($2a/$2b/$2y), longueur attendue = 60
  if (stored && stored.startsWith("$2") && stored.length === 60) {
    return bcrypt.compare(input, stored);
  }

  // Mode migration: autoriser le clair si explicitement activé
  if (process.env.ALLOW_PLAINTEXT_PASSWORDS === "1" && typeof stored === "string") {
    // ⚠️ comparaison stricte, on NE trim pas l'entrée
    return input === stored;
  }

  return false;
}


/* ======================= HANDLERS ======================= */

export async function register(req, res) {
  const {
    email,
    password,
    first_name = null,
    last_name = null,
  } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  const client = await pool.connect();
  try {
    const cols = await getUsersColumns(client);
    if (!cols.has("password_hash")) {
      return res
        .status(500)
        .json({ message: "Schéma invalide: colonne password_hash absente." });
    }

    const { rows: existing } = await client.query(
      `select id from public.users where lower(email)=lower($1) limit 1`,
      [email]
    );
    if (existing.length)
      return res.status(409).json({ message: "Email déjà utilisé." });

    const password_hash = await bcrypt.hash(password, 10);

    const fields = ["email", "password_hash"];
    const values = [email, password_hash];
    if (cols.has("first_name")) {
      fields.push("first_name");
      values.push(first_name);
    }
    if (cols.has("last_name")) {
      fields.push("last_name");
      values.push(last_name);
    }
    if (cols.has("role")) {
      fields.push("role");
      values.push("customer");
    }

    const placeholders = fields.map((_, i) => `$${i + 1}`).join(", ");
    await client.query(
      `insert into public.users (${fields.join(
        ", "
      )}) values (${placeholders})`,
      values
    );

    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error("REGISTER 500:", e);
    return res.status(500).json({ message: "Erreur serveur." });
  } finally {
    client.release();
  }
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  const client = await pool.connect();
  try {
    const cols = await getUsersColumns(client);
    if (!cols.has("password_hash")) {
      return res
        .status(500)
        .json({ message: "Schéma invalide: colonne password_hash absente." });
    }

    const sel = buildUserSelect(cols, { withPassword: true });
    const { rows } = await client.query(
      `${sel} where lower(email)=lower($1) limit 1`,
      [email]
    );
    if (!rows.length)
      return res.status(401).json({ message: "Identifiants invalides." });

    const user = rows[0];
    const stored = normalizeHash(user.password_hash);

    const ok = await comparePassword(password, stored);
    if (!ok)
      return res.status(401).json({ message: "Identifiants invalides." });

    // Auto-migration vers bcrypt si on vient d'accepter un mot de passe clair
    if (
      process.env.ALLOW_PLAINTEXT_PASSWORDS === "1" &&
      stored &&
      !stored.startsWith("$2")
    ) {
      const newHash = await bcrypt.hash(password, 10);
      await client.query(
        `update public.users set password_hash=$1 where id=$2`,
        [newHash, user.id]
      );
      user.password_hash = newHash;
    }

    const token = makeToken(user);
    delete user.password_hash;

    return res.json({
      token,
      user: {
        id: String(user.id),
        email: user.email,
        role: user.role ?? null,
        first_name: user.first_name ?? null,
        last_name: user.last_name ?? null,
        address: null,
      },
    });
  } catch (e) {
    console.error("LOGIN 500:", e);
    if (e && e.message === "JWT_SECRET manquant") {
      return res.status(500).json({ message: "Configuration JWT manquante." });
    }
    return res.status(500).json({ message: "Erreur serveur." });
  } finally {
    client.release();
  }
}

export async function me(req, res) {
  const client = await pool.connect();
  try {
    const cols = await getUsersColumns(client);
    const sel = buildUserSelect(cols, { withPassword: false });
    const { rows } = await client.query(`${sel} where id=$1 limit 1`, [
      req.user.id,
    ]);
    if (!rows.length)
      return res.status(404).json({ message: "User not found" });

    const u = rows[0];
    return res.json({
      id: String(u.id),
      email: u.email,
      role: u.role ?? null,
      first_name: u.first_name ?? null,
      last_name: u.last_name ?? null,
      address: null,
    });
  } catch (e) {
    console.error("ME 500:", e);
    return res.status(500).json({ message: "Erreur serveur." });
  } finally {
    client.release();
  }
}
