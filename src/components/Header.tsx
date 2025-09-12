import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCartCount } from "../features/cart/slice";

export default function Header(){
  const count = useSelector(selectCartCount);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString() || "";
    const next = new URLSearchParams(params);
    if (q) next.set("q", q); else next.delete("q");
    navigate(`/products?${next.toString()}`);
  }

  return (
    <header className="site-header">
  <div className="container-page bar">
    <a href="/products" className="brand">Sneakershop</a>
    <form className="search" onSubmit={onSubmit}>
      <input name="q" className="input" placeholder="Rechercher…" defaultValue={params.get("q")||""} />
    </form>
    <Link to="/cart" className="btn">Panier ({count})</Link>
  </div>
</header>

  );
}

