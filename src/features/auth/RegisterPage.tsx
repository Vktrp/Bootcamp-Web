// src/features/auth/RegisterPage.tsx

import { useMemo, useState } from "react";

import { useDispatch } from "react-redux";

import { useNavigate, Link } from "react-router-dom";

import { setUser } from "./slice";

import { signUp } from "./api";

type Country = {
  code: string;

  name: string;

  dial: string; // ex: "+33"

  trimLeadingZero: boolean; // supprime les 0 en tête du numéro local

  exampleLocal?: string; // ex: "612345678"
};

const COUNTRIES: Country[] = [
  {
    code: "FR",
    name: "France",
    dial: "+33",
    trimLeadingZero: true,
    exampleLocal: "612345678",
  },

  {
    code: "ES",
    name: "Espagne",
    dial: "+34",
    trimLeadingZero: true,
    exampleLocal: "612345678",
  },

  {
    code: "IT",
    name: "Italie",
    dial: "+39",
    trimLeadingZero: true,
    exampleLocal: "3123456789",
  },

  {
    code: "DE",
    name: "Allemagne",
    dial: "+49",
    trimLeadingZero: true,
    exampleLocal: "1512345678",
  },

  {
    code: "BE",
    name: "Belgique",
    dial: "+32",
    trimLeadingZero: true,
    exampleLocal: "471234567",
  },

  {
    code: "NL",
    name: "Pays-Bas",
    dial: "+31",
    trimLeadingZero: true,
    exampleLocal: "612345678",
  },

  {
    code: "GB",
    name: "Royaume-Uni",
    dial: "+44",
    trimLeadingZero: true,
    exampleLocal: "7123456789",
  },

  {
    code: "US",
    name: "États-Unis",
    dial: "+1",
    trimLeadingZero: false,
    exampleLocal: "4155552671",
  },

  {
    code: "MA",
    name: "Maroc",
    dial: "+212",
    trimLeadingZero: true,
    exampleLocal: "612345678",
  },

  {
    code: "UA",
    name: "Ukraine",
    dial: "+380",
    trimLeadingZero: true,
    exampleLocal: "551234567",
  },

  {
    code: "JP",
    name: "Japon",
    dial: "+81",
    trimLeadingZero: true,
    exampleLocal: "20123456",
  },
];

function cleanDigits(s: string) {
  return (s || "").replace(/[^\d]/g, "");
}

export default function RegisterPage() {
  const dispatch = useDispatch();

  const nav = useNavigate();

  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");

  const [address, setAddress] = useState("");

  const [country, setCountry] = useState<string>("FR");

  const [phoneLocal, setPhoneLocal] = useState("");

  const [password, setPassword] = useState("");

  const [confirm, setConfirm] = useState("");

  // NEW: affichage/masquage

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [err, setErr] = useState<string | null>(null);

  const c = useMemo(
    () => COUNTRIES.find((x) => x.code === country) || COUNTRIES[0],

    [country]
  );

  // numéro local sans séparateurs + suppression des zéros initiaux si nécessaire

  const normalizedLocal = useMemo(() => {
    let digits = cleanDigits(phoneLocal);

    if (c.trimLeadingZero) digits = digits.replace(/^0+/, "");

    return digits;
  }, [phoneLocal, c.trimLeadingZero]);

  // numéro international complet

  const fullPhone = useMemo(
    () => c.dial + normalizedLocal,
    [c.dial, normalizedLocal]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErr(null);

    if (!firstName || !lastName || !email || !password || !confirm) {
      setErr("Merci de remplir tous les champs obligatoires.");

      return;
    }

    if (password.length < 6) {
      setErr("Le mot de passe doit contenir au moins 6 caractères.");

      return;
    }

    if (password !== confirm) {
      setErr("Les mots de passe ne correspondent pas.");

      return;
    }

    if (normalizedLocal.length < 4) {
      setErr("Numéro de téléphone invalide.");

      return;
    }

    try {
      setLoading(true);

      const profile = await signUp({
        email,

        password,

        first_name: firstName,

        last_name: lastName,

        address,

        phone: fullPhone,
      });

      dispatch(
        setUser({
          id: profile.id,

          email: profile.email,

          first_name: profile.first_name,

          last_name: profile.last_name,

          address: profile.address,

          avatarUrl: profile.avatar_url,

          role: profile.role,

          phone: profile.phone,
        })
      );

      nav("/");
    } catch (e: any) {
      setErr(e?.message || "Échec de l’inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page" style={{ maxWidth: 560, marginTop: 32 }}>
      <div className="card" style={{ padding: 24 }}>
        <h1 className="title" style={{ fontSize: 40, marginBottom: 12 }}>
          Inscription
        </h1>
        <form onSubmit={onSubmit} className="space-y">
          {/* Identité */}
          <div
            className="grid-products"
            style={{
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            }}
          >
            <div>
              <label>Prénom</label>
              <input
                className="input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Nom</label>
              <input
                className="input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Adresse */}
          <label>Adresse</label>
          <input
            className="input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          {/* Téléphone avec pays */}
          <label>Téléphone</label>
          <div style={{ display: "flex", gap: 8 }}>
            <select
              className="input"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{ width: 180 }}
              aria-label="Pays du téléphone"
            >
              {COUNTRIES.map((x) => (
                <option key={x.code} value={x.code}>
                  {x.name} ({x.dial})
                </option>
              ))}
            </select>
            <div style={{ position: "relative", flex: 1 }}>
              <div
                style={{
                  position: "absolute",

                  left: 12,

                  top: 10,

                  color: "var(--muted-foreground)",

                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {c.dial}
              </div>
              <input
                className="input"
                inputMode="numeric"
                autoComplete="tel"
                value={phoneLocal}
                onChange={(e) => setPhoneLocal(e.target.value)}
                style={{ paddingLeft: 56 }}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <label>Mot de passe</label>
          <div style={{ position: "relative" }}>
            <input
              className="input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              title={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
              style={{
                position: "absolute",

                right: 8,

                top: 8,

                padding: "6px 10px",

                borderRadius: 8,

                border: "1px solid var(--border)",

                background: "var(--muted)",

                cursor: "pointer",
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <label>Confirmer</label>
          <div style={{ position: "relative" }}>
            <input
              className="input"
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-pressed={showConfirm}
              title={
                showConfirm
                  ? "Masquer la confirmation"
                  : "Afficher la confirmation"
              }
              style={{
                position: "absolute",

                right: 8,

                top: 8,

                padding: "6px 10px",

                borderRadius: 8,

                border: "1px solid var(--border)",

                background: "var(--muted)",

                cursor: "pointer",
              }}
            >
              {showConfirm ? "🙈" : "👁️"}
            </button>
          </div>

          {err && (
            <p className="text-danger" style={{ marginTop: 8 }}>
              {err}
            </p>
          )}
          <button className="btn" disabled={loading} style={{ marginTop: 12 }}>
            {loading ? "Création…" : "Créer mon compte"}
          </button>
        </form>

        {/* Lien retour connexion */}
        <div
          style={{
            borderTop: "1px solid var(--border)",

            marginTop: 16,

            paddingTop: 12,

            textAlign: "center",
          }}
        >
          <span className="text-sm">Déjà inscrit·e ? </span>
          <Link
            to="/login"
            className="text-sm"
            style={{ color: "var(--accent)" }}
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
