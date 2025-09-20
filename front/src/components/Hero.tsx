// src/components/Hero.tsx
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="hero container-page">
      <div>
        <h1 className="title">
          La sélection <span style={{ color: "var(--accent)" }}>confort</span>{" "}
          de la saison
        </h1>

        <p className="subtitle">
          Des sneakers légères, un amorti premium, et des stocks en temps réel
          par pointure.
        </p>

        <div className="cta">
          {/* Bouton "nouveautés" seul sur sa ligne */}
          <div className="cta-row">
            <Link to="/products" className="btn">
              Voir les nouveautés
            </Link>
          </div>

          {/* Les 3 collections sur la même ligne */}
          <div className="cta-row group">
            <Link to="/products?category=men" className="btn-outline">
              Collection Homme
            </Link>
            <Link to="/products?category=women" className="btn-outline">
              Collection Femme
            </Link>
            <Link
              to="/products?category=infant
"
              className="btn-outline"
            >
              Collection Enfant
            </Link>
          </div>
        </div>
      </div>

      <div className="img-wrap">
        <img
          className="img"
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop"
          alt="Sneaker hero"
        />
      </div>
    </section>
  );
}
