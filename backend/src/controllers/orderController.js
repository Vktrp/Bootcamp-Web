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

// Lister les articles d'une commande
export const getOrderItems = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        oi.id,
        oi.order_id,
        oi.product_variant_id,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        oi.created_at,
        pv.name AS variant_name,
        pv.sku,
        pv."size_eu",
        p.brand,
        p.silhouette,
        p.gender
      FROM order_items oi
      JOIN product_variant pv ON oi.product_variant_id = pv.variant_id
      JOIN product p ON pv.id_model = p.id
      WHERE oi.order_id = $1
      ORDER BY oi.created_at ASC
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun article trouvé pour cette commande" });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Erreur getOrderItems:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Créer une commande
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id; // récupéré depuis le JWT
    const { shipping_address, billing_address, payment_method } = req.body;

    const result = await pool.query(
      `INSERT INTO orders (user_id, order_number, status, total_amount, shipping_address, billing_address, payment_method, payment_status)
       VALUES ($1, CONCAT('ORD-', FLOOR(RANDOM()*9000 + 1000)), 'pending', 0, $2, $3, $4, 'pending')
       RETURNING *`,
      [userId, shipping_address, billing_address, payment_method]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur createOrder:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Lister toutes les commandes (admin uniquement)
export const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM orders
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Erreur getAllOrders:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Lister toutes les commandes de l'utilisateur connecté avec les articles
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT 
        o.id AS order_id,
        o.order_number,
        o.status,
        o.total_amount,
        o.created_at,
        o.updated_at,
        o.payment_status,
        oi.id AS item_id,
        oi.product_variant_id,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        pv.name AS variant_name,
        pv.sku,
        pv."size_eu",
        pv.silhouette,
        p.brand,
        p.image
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN product_variant pv ON oi.product_variant_id = pv.variant_id
      LEFT JOIN product p ON pv.silhouette = p.silhouette
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC, oi.created_at ASC
      `,
      [userId]
    );

    // Regrouper commandes + items en JSON structuré
    const orders = {};
    result.rows.forEach((row) => {
      if (!orders[row.order_id]) {
        orders[row.order_id] = {
          id: row.order_id,
          order_number: row.order_number,
          status: row.status,
          total_amount: row.total_amount,
          payment_status: row.payment_status,
          created_at: row.created_at,
          updated_at: row.updated_at,
          items: [],
        };
      }
      if (row.item_id) {
        orders[row.order_id].items.push({
          id: row.item_id,
          product_variant_id: row.product_variant_id,
          quantity: row.quantity,
          unit_price: row.unit_price,
          total_price: row.total_price,
          variant_name: row.variant_name,
          sku: row.sku,
          size_eu: row.size_eu,
          brand: row.brand,
          silhouette: row.silhouette,
          gender: row.gender,
        });
      }
    });

    res.json(Object.values(orders));
  } catch (error) {
    console.error("❌ Erreur getMyOrders:", error.message);
    res.status(500).json({ error: error.message });
  }
};
