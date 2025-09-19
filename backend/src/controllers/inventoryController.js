import pool from "../models/db.js";

// Mettre à jour la quantité (admin)
export const updateInventory = async (req, res) => {
  try {
    const { variant_id, quantity } = req.body;

    if (!variant_id || quantity === undefined) {
      return res.status(400).json({ error: "variant_id et quantity sont requis" });
    }

    // Admin met à jour le stock
    const result = await pool.query(
      `UPDATE inventory
       SET quantity = $1
       WHERE variant_id = $2
       RETURNING *`,
      [quantity, variant_id]
    );


    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Variant non trouvé dans Inventory" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur updateInventory:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Décrémenter après une commande
export const decrementInventory = async (req, res) => {
  try {
    const { variant_id, quantity } = req.body;

    if (!variant_id || !quantity) {
      return res.status(400).json({ error: "variant_id et quantity sont requis" });
    }

    const result = await pool.query(
      `UPDATE inventory
       SET quantity = GREATEST(quantity - $1, 0)
       WHERE variant_id = $2
       RETURNING *`,
      [quantity, variant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Variant non trouvé dans Inventory" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur decrementInventory:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getInventoryByVariant = async (req, res) => {
  try {
    const { variant_id } = req.params;
    const result = await pool.query(
      `SELECT * FROM inventory WHERE variant_id = $1`,
      [variant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Variant non trouvé dans l'inventaire" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur getInventoryByVariant:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Lister tout l'inventaire
export const getAllInventory = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM inventory ORDER BY variant_id");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Erreur getAllInventory:", error.message);
    res.status(500).json({ error: error.message });
  }
};
