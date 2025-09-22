// backend/src/middleware/authMiddleware.js

import jwt from "jsonwebtoken";

/** Exige un JWT valide et attache req.user */

export function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";

  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload;

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

/** Exige rôle admin (chaîne insensible à la casse) */

export function requireAdmin(req, res, next) {
  if (!req.user) {
    // si pas encore auth, on chaîne requireAuth puis on revient ici

    return requireAuth(req, res, () => requireAdmin(req, res, next));
  }

  const role = String(req.user.role || "").toLowerCase();

  if (role !== "admin") return res.status(403).json({ message: "Forbidden" });

  return next();
}

/** Optionnel : essaye de parser le token, continue quoi qu’il arrive */

export function maybeAuth(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";

    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;

    if (token) {
      try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
      } catch {
        // token invalide : on ignore, pas d'erreur bloquante
      }
    }
  } catch {
    // rien
  }

  return next();
}

// Alias conservé pour compat avec les anciens imports

export const authMiddleware = requireAuth;

export default requireAuth;
