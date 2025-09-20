// src/features/auth/RegisterPage.tsx

 import { useState } from "react";

 import { useDispatch } from "react-redux";

 import { useNavigate, Link } from "react-router-dom";

 import { setSession } from "./slice";

 import { signUp, getMe, getToken } from "./api";

 export default function RegisterPage() {

  const dispatch = useDispatch();

  const nav = useNavigate();

  const [firstName, setFirstName] = useState("");

  const [lastName,  setLastName]  = useState("");

  const [email,     setEmail]     = useState("");

  const [password,  setPassword]  = useState("");

  const [confirm,   setConfirm]   = useState("");

  const [err,       setErr]       = useState<string | null>(null);

  const [loading,   setLoading]   = useState(false);

  async function onSubmit(e: React.FormEvent) {

    e.preventDefault();

    setErr(null);

    if (password !== confirm) {

      setErr("Les mots de passe ne correspondent pas.");

      return;

    }

    setLoading(true);

    try {

      await signUp({

        email,

        password,

        first_name: firstName || undefined,

        last_name: lastName || undefined,

      });

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

      nav("/account", { replace: true });

    } catch (e: any) {

      const msg =

        e?.message?.toLowerCase?.().includes("email") &&

        e?.message?.toLowerCase?.().includes("utilisé")

          ? "Cet email est déjà utilisé."

          : e?.message || "Inscription impossible.";

      setErr(msg);

    } finally {

      setLoading(false);

    }

  }

  return (
<div className="container-page" style={{ maxWidth: 520 }}>
<div className="card">
<h1 className="text-xl font-semibold mb-3">Inscription</h1>
<form onSubmit={onSubmit} className="grid gap-3">
<div className="grid md:grid-cols-2 gap-3">
<div>
<label>Prénom</label>
<input className="input" value={firstName}

                     onChange={(e) => setFirstName(e.target.value)} />
</div>
<div>
<label>Nom</label>
<input className="input" value={lastName}

                     onChange={(e) => setLastName(e.target.value)} />
</div>
</div>
<div>
<label>Email</label>
<input

              className="input"

              type="email"

              required

              value={email}

              onChange={(e) => setEmail(e.target.value)}

              autoComplete="email"

            />
</div>
<div className="grid md:grid-cols-2 gap-3">
<div>
<label>Mot de passe</label>
<input

                className="input"

                type="password"

                required

                value={password}

                onChange={(e) => setPassword(e.target.value)}

                autoComplete="new-password"

              />
</div>
<div>
<label>Confirmation</label>
<input

                className="input"

                type="password"

                required

                value={confirm}

                onChange={(e) => setConfirm(e.target.value)}

                autoComplete="new-password"

              />
</div>
</div>

          {err && <div className="text-danger">{err}</div>}
<button className="btn" disabled={loading}>

            {loading ? "Création…" : "Créer mon compte"}
</button>
</form>
<div className="mt-3 text-sm">

          Déjà inscrit ? <Link to="/login">Connectez-vous</Link>
</div>
</div>
</div>

  );

 }