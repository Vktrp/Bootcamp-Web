import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AccountMenu from "./AccountMenu";
import ThemeSwitch from "./ThemeSwitch";

export default function Header() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString() || "";
    const next = new URLSearchParams(params);
    if (q) next.set("q", q);
    else next.delete("q");
    navigate(`/products?${next.toString()}`);
  }

  return (
    <header className="site-header">
      <div className="container-page bar">
        <Link to="/products" className="brand">
          Sneakershop
        </Link>

        <form className="search" onSubmit={onSubmit}>
          <input
            name="q"
            className="input"
            placeholder="Rechercher…"
            defaultValue={params.get("q") || ""}
          />
        </form>

        <nav style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <nav style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <ThemeSwitch /> {/* 👈 le bouton thème est ici */}
          </nav>
          <AccountMenu />
        </nav>
      </div>
    </header>
  );
}
