import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "super_secret", (err, user) => {
    if (err) return res.status(403).json({ message: "Token invalide" });
    req.user = user; // { id, role }
    next();
  });
};

// Vérifie si admin
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Accès réservé aux admins" });
  }
  next();
};
