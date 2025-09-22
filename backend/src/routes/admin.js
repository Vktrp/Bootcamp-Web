import { Router } from "express";

 import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

 import { listUsers, updateUser } from "../controllers/usersController.js";

 const router = Router();

 // Liste des users pour l'UI admin

 router.get("/users", requireAuth, requireAdmin, listUsers);

 // Mise à jour rôle / is_active

 router.patch("/users/:id", requireAuth, requireAdmin, updateUser);

 export default router;