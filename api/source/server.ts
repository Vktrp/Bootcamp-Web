import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT || 3001);
const ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();
app.use(express.json());
app.use(cookieParser());

// CORS pour le front Vite
app.use(
  cors({
    origin: ORIGIN,        
    credentials: true,     
  })
);

/** --------- DÉMOS /auth ---------- **/
app.post("/auth/login", (req, res) => {
  const { email } = req.body || {};
  // ici tu valides le mot de passe etc.
  // res.cookie("sid", sessionId, { httpOnly:true, sameSite:"lax", secure:false });
  res.json({ id: "1", email: email ?? "user@demo.local", role: "customer" });
});

app.get("/auth/me", (req, res) => {
  // si tu utilises un cookie de session, vérifie-le ici
  // if (!req.cookies.sid) return res.sendStatus(401);
  res.json({ id: "1", email: "user@demo.local", role: "customer" });
});

app.post("/auth/logout", (req, res) => {
  res.clearCookie("sid");
  res.sendStatus(204);
});


app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT} (origin: ${ORIGIN})`);
});
