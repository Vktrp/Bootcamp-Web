import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("👟 Liste des produits");
});

export default router;
