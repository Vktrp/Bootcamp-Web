import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "./api";
import { setUser } from "./slice";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const user = await login({ email, password });
      dispatch(setUser(user));
      nav("/");
    } catch (e: any) {
      // TypeError => souvent “Failed to fetch” (CORS ou serveur down)
      const msg =
        e?.name === "TypeError"
          ? "Impossible de joindre le serveur. Vérifie l’API (port 3001) et le CORS."
          : e?.message || "Échec de connexion";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  // Bouton de secours pour continuer à dév sans API
  function devDemo(role: "customer" | "seller" | "admin") {
    dispatch(setUser({ id: "dev", email: `${role}@demo.local`, role } as any));
    nav("/");
  }

  return (
    <div className="container-page" style={{ maxWidth: 480, marginTop: 32 }}>
      <div className="card" style={{ padding: 24 }}>
        <h1 className="title" style={{ fontSize: 40, marginBottom: 12 }}>
          Connexion
        </h1>

        <form onSubmit={onSubmit} className="space-y">
          <label>Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@ex.com"
          />
          <label>Mot de passe</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {err && (
            <p className="text-danger" style={{ marginTop: 8 }}>
              {err}
            </p>
          )}
          <button className="btn" disabled={loading} style={{ marginTop: 12 }}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div
          style={{
            borderTop: "1px solid var(--border)",
            marginTop: 16,
            paddingTop: 12,
          }}
        >
          <p className="text-sm">Pas d’API dispo ? Mode démo :</p>
          <div
            style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}
          >
            <button className="btn-outline" onClick={() => devDemo("customer")}>
              Customer
            </button>
            <button className="btn-outline" onClick={() => devDemo("seller")}>
              Seller
            </button>
            <button className="btn-outline" onClick={() => devDemo("admin")}>
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
