import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../models/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret";

// 📌 Inscription
export const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role, created_at`,
      [email, hashedPassword, first_name, last_name]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error("❌ Erreur register:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 📌 Connexion
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("❌ Erreur login:", error.message);
    res.status(500).json({ error: error.message });
  }
};
