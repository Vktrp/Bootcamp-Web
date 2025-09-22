import "dotenv/config";

 import express from "express";

 import cors from "cors";

 import authRoutes from "./routes/auth.js";
 
 import adminRoutes from "./routes/admin.js";

 const app = express();

 const PORT = process.env.PORT || 5050;

 // CORS – adapte si besoin l'origine de ton front.

 app.use(

  cors({

    origin: [

      "http://localhost:5173",

      "http://127.0.0.1:5173",

      "http://localhost:3000",

      "http://127.0.0.1:3000",

    ],

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],

  })

 );

 app.use(express.json());

 // Routes

 app.use("/auth", authRoutes);

 // Health

 app.get("/health", (req, res) => res.json({ ok: true }));

 app.use("/admin", adminRoutes);
 // 404

 app.use((req, res) => res.status(404).json({ message: "Not found" }));

 app.listen(PORT, () => {

  console.log(`API on :${PORT}`);

 });