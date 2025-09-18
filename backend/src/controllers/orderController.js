import pool from "../models/db.js";

// Ajouter un article dans une commande
export const addOrderItem = async (req, res) => {
  try {
    const { order_id, product_variant_id, quantity } = req.body;

    if (!order_id || !product_variant_id) {
      return res.status(400).json({ error: "order_id et product_variant_id sont requis" });
    }

    const result = await pool.query(
      `INSERT INTO order_items (order_id, product_variant_id, quantity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [order_id, product_variant_id, quantity || 1] // fallback sur 1
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur addOrderItem:", error.message);
    res.status(500).json({ error: error.message });
  }
};
