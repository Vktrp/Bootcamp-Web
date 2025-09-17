import bcrypt from "bcrypt";
import pool from "../models/db.js";

// 📌 Inscription
export const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Vérifier si l'email existe déjà
    const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer dans la BDD
    const newUser = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role, created_at`,
      [email, hashedPassword, first_name, last_name]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error("❌ Erreur register:", error);
    res.status(500).json({ error: error.message });
  }  
  console.log("📩 register request:", req.body);
};


