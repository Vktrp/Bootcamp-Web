import jwt from "jsonwebtoken";

 // protège une route si token JWT valide

 export function requireAuth(req, res, next) {

  const hdr = req.headers.authorization || "";

  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload;

    next();

  } catch {

    return res.status(401).json({ message: "Invalid token" });

  }

 }

 // admin uniquement

 export function requireAdmin(req, res, next) {

  if (!req.user) return requireAuth(req, res, () => requireAdmin(req, res, next));

  const role = String(req.user.role || "").toLowerCase();

  if (role !== "admin") return res.status(403).json({ message: "Forbidden" });

  next();

 }

 // ⬇️ ALIAS pour compatibilité avec les imports existants

 export const authMiddleware = requireAuth;