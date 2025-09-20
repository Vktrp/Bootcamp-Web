// src/components/AccountMenu.tsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectCartCount } from "@/features/cart/slice";
import { selectRole, selectUser, setUser } from "@/features/auth/slice";

export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const user = useSelector(selectUser);
  const role = useSelector(selectRole); 
  const cartCount = useSelector(selectCartCount);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    function onWindowClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setOpen(false);
    }
    window.addEventListener("click", onWindowClick);
    return () => window.removeEventListener("click", onWindowClick);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleLogout(e?: React.MouseEvent) {
    e?.stopPropagation();
    dispatch(setUser(null));
    setOpen(false);
    navigate("/");
  }

  const initial = user?.email?.slice(0, 1)?.toUpperCase();
  const avatarUrl = (user as any)?.avatarUrl as string | undefined;

  return (
    <div className="user-menu">
      <button
        ref={btnRef}
        className={"menu-button" + (open ? " is-open" : "")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="avatar" aria-hidden="true">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              style={{ width: 28, height: 28, borderRadius: "999px" }}
            />
          ) : initial ? (
            <span>{initial}</span>
          ) : (
            <IconUserCircle />
          )}
        </span>
        <span className="sr-only">Menu</span>
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
              <div className="menu-header">Bonjour!</div>

              {role === "customer" && (
                <>
                  <Link
                    to="/account"
                    className="menu-item"
                    onClick={() => setOpen(false)}
                  >
                    Mon compte
                  </Link>
                  <Link
                    to="/orders"
                    className="menu-item"
                    onClick={() => setOpen(false)}
                  >
                    Mes commandes
                  </Link>
                  <Link
                    to="/cart"
                    className="menu-item"
                    onClick={() => setOpen(false)}
                  >
                    Mon panier{cartCount ? ` (${cartCount})` : ""}
                  </Link>
                  <Link
                    to="/favorites"
                    className="menu-item"
                    onClick={() => setOpen(false)}
                  >
                    Mes favoris
                  </Link>
                  <div className="menu-divider" />
                </>
              )}

              {role === "seller" && (
                <>
                  <Link
                    to="/account"
                    className="menu-item"
                    onClick={() => setOpen(false)}
                  >
                    Mon compte
                  </Link>
                  <Link
                    to="/seller"
                    className="menu-item"
                    onClick={() => setOpen(false)}
                  >
                    Espace vendeur
                  </Link>
                  <div className="menu-divider" />
                </>
              )}

              {role === "admin" && (
                <>
                  <Link
                    to="/account"
                    className="menu-item"
                    onClick={() => setOpen(false)}
                  >
                    Mon compte
                  </Link>
                  <Link
                    to="/admin"
                    className="menu-item"
                    onClick={() => setOpen(false)}
                  >
                    Espace admin
                  </Link>
                  <div className="menu-divider" />
                </>
              )}

              <button
                type="button"
                className="menu-item danger"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={handleLogout}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <div className="menu-header">Bienvenue</div>
              <Link
                to="/login"
                className="menu-item"
                onClick={() => setOpen(false)}
              >
                Se connecter
              </Link>
            </>
          )}
        </div>
      )}
    </div>
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
