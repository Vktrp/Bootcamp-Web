import pool from "../models/db.js";

// Ajouter un article dans une commande ET mettre à jour l'inventaire
export const addOrderItem = async (req, res) => {
  const client = await pool.connect();
  try {
    const { order_id, product_variant_id, quantity } = req.body;

    await client.query("BEGIN");

    // Insérer l'article dans la commande
    const orderItem = await client.query(
      `INSERT INTO order_items (order_id, product_variant_id, quantity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [order_id, product_variant_id, quantity || 1]
    );

    // Décrémenter l'inventaire
    const inventoryUpdate = await client.query(
      `UPDATE inventory
       SET quantity = GREATEST(quantity - $1, 0)
       WHERE variant_id = $2
       RETURNING *`,
      [quantity || 1, product_variant_id]
    );

    await client.query("COMMIT");

    res.status(201).json({
      orderItem: orderItem.rows[0],
      inventory: inventoryUpdate.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Erreur addOrderItem:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};
