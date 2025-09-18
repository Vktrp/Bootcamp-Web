import { Router } from "express";
import { addOrderItem } from "../controllers/orderController.js";

const router = Router();

router.post("/items", addOrderItem);

export default router;
