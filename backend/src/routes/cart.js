import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("🛒 Panier de l'utilisateur");
});

export default router;
