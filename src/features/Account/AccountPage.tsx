import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectUser, selectRole } from "../auth/slice";

export default function AccountPage() {
  const user = useSelector(selectUser);
  const role = useSelector(selectRole); // "customer" | "seller" | "admin"

  return (
    <div className="container-page" style={{ maxWidth: 960 }}>
      <h1 className="text-xl font-semibold mb-2">Mon compte</h1>

      {/* Infos personnelles */}
      <div className="card" style={{ padding: 16 }}>
        <div
          className="grid-products"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <div>
            <div className="text-sm">Prénom</div>
            <div className="font-semibold">{user?.first_name ?? "—"}</div>
          </div>
          <div>
            <div className="text-sm">Nom</div>
            <div className="font-semibold">{user?.last_name ?? "—"}</div>
          </div>
          <div>
            <div className="text-sm">Email</div>
            <div className="font-semibold">{user?.email ?? "—"}</div>
          </div>
          <div>
            <div className="text-sm">Adresse</div>
            <div className="font-semibold">{user?.address ?? "—"}</div>
          </div>
        </div>
      </div>

      {/* Raccourcis par rôle */}
      <div
        className="grid-products"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          marginTop: 16,
        }}
      >
        {/* CUSTOMER : seulement commandes (pas panier/favoris ici) */}
        {role === "customer" && (
          <Link to="/orders" className="card" style={{ padding: 16 }}>
            <div className="font-semibold">Mes commandes</div>
            <div className="text-sm">Consulter l’historique</div>
          </Link>
        )}

        {/* SELLER : uniquement espace vendeur */}
        {role === "seller" && (
          <Link to="/seller" className="card" style={{ padding: 16 }}>
            <div className="font-semibold">Espace vendeur</div>
            <div className="text-sm">Tableau de bord & stocks</div>
          </Link>
        )}

        {/* ADMIN : uniquement espace admin */}
        {role === "admin" && (
          <Link to="/admin" className="card" style={{ padding: 16 }}>
            <div className="font-semibold">Espace admin</div>
            <div className="text-sm">Utilisateurs & stats</div>
          </Link>
        )}
      </div>
    </div>
  );
}
