import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./models/db.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import inventoryRoutes from "./routes/inventory.js";


// Charger les variables d'environnement
dotenv.config();

// Initialiser Express
const app = express();
app.use(cors());
app.use(express.json());

// Déclaration des routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/inventory", inventoryRoutes);

// Test DB
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur DB" });
  }
});

// ⚠️ Optionnel : recalage des séquences
async function fixSequences() {
  try {
    await pool.query(`
      DO $$
      DECLARE
          r RECORD;
      BEGIN
          FOR r IN
              SELECT c.oid::regclass AS table_name,
                     a.attname AS column_name,
                     pg_get_serial_sequence(c.oid::regclass::text, a.attname) AS seq_name
              FROM pg_class c
              JOIN pg_attribute a ON a.attrelid = c.oid
              JOIN pg_namespace n ON n.oid = c.relnamespace
              WHERE a.attnum > 0
                AND NOT a.attisdropped
                AND pg_get_serial_sequence(c.oid::regclass::text, a.attname) IS NOT NULL
                AND n.nspname = 'public'
          LOOP
              EXECUTE format(
                'SELECT setval(''%s'', COALESCE((SELECT MAX(%I) FROM %s), 0) + 1, false)',
                r.seq_name, r.column_name, r.table_name
              );
          END LOOP;
      END $$;
    `);
    console.log("✅ Séquences recalées avec succès !");
  } catch (err) {
    console.error("❌ Erreur recalage séquences:", err.message);
  }
}

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  // ⚠️ tu peux commenter cette ligne si ça bloque trop avec IPv6/DNS
  await fixSequences();
});
