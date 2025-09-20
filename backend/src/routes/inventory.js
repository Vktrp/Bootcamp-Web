// src/routes/inventory.js
import { Router } from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import {
  updateInventory,
  decrementInventory,
  getInventoryByVariant,
  getAllInventory,
} from "../controllers/inventoryController.js";

const router = Router();

// Admin: mettre à jour le stock
router.put("/", authMiddleware, isAdmin, updateInventory);

// Décrémenter après commande (authentifié mais pas forcément admin)
router.post("/decrement", authMiddleware, decrementInventory);

// Lire une variante précise
router.get("/:variant_id", authMiddleware, getInventoryByVariant);

// Lister tout l’inventaire (admin)
router.get("/", authMiddleware, isAdmin, getAllInventory);

export default router;
