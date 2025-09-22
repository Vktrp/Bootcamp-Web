import { Router } from "express";

import { createOrder, payAndSave } from "../controllers/checkoutController.js";

// (optionnel) import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// POST /checkout/pay

router.post("/pay", createOrder); // ou: router.post("/pay", requireAuth, payAndSave);

export default router;
