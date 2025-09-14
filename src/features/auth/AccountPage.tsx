import { useSelector } from "react-redux";
import { selectUser, selectRole } from "./slice";
import { Link } from "react-router-dom";

export default function AccountPage() {
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);

  if (!user) {
    return (
      <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1 className="font-semibold" style={{ fontSize: 20 }}>
          Mon compte
        </h1>
        <p className="mt-2">Vous n’êtes pas connecté.</p>
        <Link className="btn mt-3" to="/login">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 className="font-semibold" style={{ fontSize: 20 }}>
        Mon compte
      </h1>
      <p className="mt-2">Email: {user.email}</p>
      <p className="mt-1">
        Rôle: <span className="badge">{role}</span>
      </p>

      <div
        className="mt-3"
        style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
      >
        <Link className="btn-outline" to="/orders">
          Mes commandes
        </Link>
        {(role === "seller" || role === "admin") && (
          <Link className="btn-outline" to="/seller">
            Espace Vendeur
          </Link>
        )}
        {role === "admin" && (
          <>
            <Link className="btn-outline" to="/admin">
              Dashboard Admin
            </Link>
            <Link className="btn-outline" to="/admin/stock">
              Stock
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
