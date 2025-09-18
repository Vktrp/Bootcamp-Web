import pool from "../models/db.js";

// Liste tous les produits
export const getProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM product LIMIT 50");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Erreur getProducts:", error.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Détail produit
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM product WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur getProductById:", error.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
