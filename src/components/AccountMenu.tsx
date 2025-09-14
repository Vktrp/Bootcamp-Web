// src/components/AccountMenu.tsx
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { selectCartCount } from "../features/cart/slice";
import { selectUser, selectRole, setUser } from "../features/auth/slice";
import { useTheme } from "../app/providers/ThemeProvider";

export default function AccountMenu() {
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const cartCount = useSelector(selectCartCount);
  const dispatch = useDispatch();

  const { pref, setPref, effective } = useTheme();

  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // fermer au clic extérieur / touche ESC
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initial = user?.email?.slice(0, 1).toUpperCase();
  const avatarUrl = (user as any)?.avatarUrl as string | undefined;

  return (
    <div className="user-menu">
      <button
        ref={btnRef}
        className={"menu-button" + (open ? " is-open" : "")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title="Profil"
      >
        <span className="avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" />
          ) : initial ? (
            <span>{initial}</span>
          ) : (
            <IconUserCircle />
          )}
        </span>
      </button>

      {open && (
        <div
          className="menu-panel"
          ref={panelRef}
          role="menu"
          aria-label="Menu compte"
        >
          {user ? (
            <>
              <div className="menu-header">
                Bonjour, {user.email?.split("@")[0]}
              </div>

              <Link
                className="menu-item"
                to="/account"
                onClick={() => setOpen(false)}
              >
                <IconUser /> Mon compte
              </Link>
              <Link
                className="menu-item"
                to="/orders"
                onClick={() => setOpen(false)}
              >
                <IconOrders /> Mes commandes
              </Link>
              <Link
                className="menu-item"
                to="/favorites"
                onClick={() => setOpen(false)}
              >
                <IconHeart /> Mes favoris
              </Link>
              <Link
                className="menu-item"
                to="/cart"
                onClick={() => setOpen(false)}
              >
                <IconCart /> Panier ({cartCount})
              </Link>

              {(role === "seller" || role === "admin") && (
                <Link
                  className="menu-item"
                  to="/seller"
                  onClick={() => setOpen(false)}
                >
                  <IconStore /> Espace vendeur
                </Link>
              )}
              {role === "admin" && (
                <Link
                  className="menu-item"
                  to="/admin"
                  onClick={() => setOpen(false)}
                >
                  <IconShield /> Admin
                </Link>
              )}

              <div className="menu-divider" />

              <div className="menu-row">
                <div className="menu-label">
                  <IconMoon /> Thème
                </div>
                <select
                  className="input"
                  value={pref}
                  onChange={(e) => setPref(e.target.value as any)}
                  style={{ width: 150 }}
                >
                  <option value="system">Système ({effective})</option>
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                </select>
              </div>

              <button
                className="menu-item danger"
                onClick={() => {
                  dispatch(setUser(null));
                  setOpen(false);
                }}
              >
                <IconLogout /> Déconnexion
              </button>
            </>
          ) : (
            <>
              <div className="menu-header">Bienvenue</div>
              <Link
                className="menu-item"
                to="/login"
                onClick={() => setOpen(false)}
              >
                <IconLogin /> Se connecter
              </Link>

              <div className="menu-divider" />
              <div className="menu-row">
                <div className="menu-label">
                  <IconMoon /> Thème
                </div>
                <select
                  className="input"
                  value={pref}
                  onChange={(e) => setPref(e.target.value as any)}
                  style={{ width: 150 }}
                >
                  <option value="system">Système ({effective})</option>
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                </select>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* --- icônes --- */
function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-5 0-9 2.5-9 5v1h18v-1c0-2.5-4-5-9-5"
      />
    </svg>
  );
}
function IconOrders() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M7 3h10a2 2 0 0 1 2 2v14l-7-3l-7 3V5a2 2 0 0 1 2-2"
      />
    </svg>
  );
}
function IconHeart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12.1 18.55L12 18.65l-.1-.1C7.14 14.24 4 11.39 4 8.5A3.5 3.5 0 0 1 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5A3.5 3.5 0 0 1 20 8.5c0 2.89-3.14 5.74-7.9 10.05Z"
      />
    </svg>
  );
}
function IconCart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M7 18a2 2 0 1 0 0 4a2 2 0 0 0 0-4m10 0a2 2 0 1 0 0 4a2 2 0 0 0 0-4M7.16 14l.84-2h9a2 2 0 0 0 1.86-1.25l2.72-6.33L19.42 3L17 8H8.1L7 5H3v2h2l3.6 7.59L7.16 18H19v-2z"
      />
    </svg>
  );
}
function IconStore() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M4 4h16l-1 5a4 4 0 0 1-8 0a4 4 0 0 1-8 0zm1 9.09A6 6 0 0 0 10 12a6 6 0 0 0 5 1.09V20H5z"
      />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12 2l7 4v6c0 5-3.4 9.74-7 10c-3.6-.26-7-5-7-10V6z"
      />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 2a9 9 0 1 0 9 9a7 7 0 0 1-9-9" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M14 7v-4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9v-4H7v-10zM20 12l-5-5v3h-6v4h6v3z"
      />
    </svg>
  );
}
function IconLogin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M10 17v4h9a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-9v4h7v10zM3 12l5 5v-3h6v-4H8V7z"
      />
    </svg>
  );
}
function IconUserCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12a4 4 0 1 0-4-4a4 4 0 0 0 4 4m0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Zm0-12a10 10 0 1 0 0 20a10 10 0 0 0 0-20Z"
      />
    </svg>
  );
}
