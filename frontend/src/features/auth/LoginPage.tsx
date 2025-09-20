// src/features/auth/LoginPage.tsx

 import { useState } from "react";

 import { useDispatch } from "react-redux";

 import { useNavigate, useLocation, Link } from "react-router-dom";

 import { setSession } from "./slice";

 import { signIn, getMe, getToken } from "./api";

 export default function LoginPage() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const nav = useNavigate();

  const location = useLocation();

  const after = (location.state as any)?.from || "/account";

  async function onSubmit(e: React.FormEvent) {

    e.preventDefault();

    setErr(null);

    setLoading(true);

    try {

      await signIn(email, password);

      const me = await getMe();

      const token = getToken()!;

      dispatch(

        setSession({

          user: {

            id: String(me.id),

            email: me.email,

            role: (me.role ?? null) as any,

            first_name: me.first_name ?? null,

            last_name: me.last_name ?? null,

            address: me.address ?? null,

          },

          token,

        }) as any

      );

      nav(after, { replace: true });

    } catch (e: any) {

      const msg =

        e?.message?.toLowerCase?.().includes("password") ||

        e?.message?.toLowerCase?.().includes("mot de passe")

          ? "Email ou mot de passe invalide."

          : "Connexion au serveur impossible.";

      setErr(msg);

    } finally {

      setLoading(false);

    }

  }

  return (
<div className="container-page" style={{ maxWidth: 420 }}>
<div className="card">
<h1 className="text-xl font-semibold mb-3">Connexion</h1>
<form onSubmit={onSubmit} className="space-y-3">
<div>
<label>Email</label>
<input

              className="input"

              type="email"

              value={email}

              onChange={(e) => setEmail(e.target.value)}

              required

              autoComplete="email"

            />
</div>
<div>
<label>Mot de passe</label>
<input

              className="input"

              type="password"

              value={password}

              onChange={(e) => setPassword(e.target.value)}

              required

              autoComplete="current-password"

            />
</div>

          {err && <div className="text-danger">{err}</div>}
<button className="btn" disabled={loading}>

            {loading ? "Connexion…" : "Se connecter"}
</button>
</form>
<div className="mt-3 text-sm">

          Pas de compte ? <Link to="/register">Inscrivez-vous</Link>
</div>
</div>
</div>

  );

 }