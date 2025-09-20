import { Router } from "express";
import { addOrderItem } from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Un client connecté peut ajouter un article à une commande
router.post("/items", authMiddleware, addOrderItem);

export default router;
