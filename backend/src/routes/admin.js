// src/routes/admin.js

 import express from "express";

 import { requireAdmin } from "../middleware/authMiddleware.js";

 import {

  listUsers,

  updateUserRole,

  setUserActive,

 } from "../controllers/usersController.js";

 const router = express.Router();

 router.get("/users", requireAdmin, listUsers);

 router.patch("/users/:id/role", requireAdmin, updateUserRole);

 router.patch("/users/:id/active", requireAdmin, setUserActive);

 export default router;