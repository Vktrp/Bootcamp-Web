import jwt from "jsonwebtoken";

 export function authMiddleware(req, res, next) {

  try {

    const hdr = req.headers.authorization || "";

    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: String(payload.id), role: payload.role ?? null };

    next();

  } catch {

    return res.status(401).json({ message: "Unauthorized" });

  }

 }