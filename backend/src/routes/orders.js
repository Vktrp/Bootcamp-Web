import { Router } from "express";
import {
  createOrder,
  addOrderItem,
  getOrderItems,
  getMyOrders,
  getAllOrders,
} from "../controllers/orderController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Créer une commande (client)
router.post("/", authMiddleware, createOrder);

// Ajouter un article à une commande
router.post("/items", authMiddleware, addOrderItem);

// Voir les articles d'une commande
router.get("/:id/items", authMiddleware, getOrderItems);

// Voir MES commandes (client)
router.get("/my", authMiddleware, getMyOrders);

// Voir TOUTES les commandes (admin)
router.get("/", authMiddleware, isAdmin, getAllOrders);

export default router;
