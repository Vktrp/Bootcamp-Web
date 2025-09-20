import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-page bar">
        <span>© {new Date().getFullYear()} Sneakershop</span>
        <nav style={{ display: "flex", gap: "1rem" }}>
          <Link to="/rgpd/privacy">Politique de confidentialité</Link>
        </nav>
      </div>
    </footer>
  );
}
