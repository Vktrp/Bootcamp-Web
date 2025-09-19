import { Router } from "express";
import {
  updateInventory,
  decrementInventory,
  getInventoryByVariant,
  getAllInventory,
} from "../controllers/inventoryController.js";

import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// 🔒 accessible uniquement aux admins
router.put("/", authMiddleware, isAdmin, updateInventory);

// ✅ accessible aux clients connectés
router.post("/decrement", authMiddleware, decrementInventory);

// 📦 accessible à tous (lecture seule)
router.get("/", getAllInventory);
router.get("/:variant_id", getInventoryByVariant);

export default router;
