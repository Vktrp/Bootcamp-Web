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
          <div className="cta-row">
            <a href="/products" className="btn">
              Voir les nouveautés
            </a>
          </div>

          <div className="cta-row group">
            <a href="/products?category=MEN" className="btn-outline">
              Collection Homme
            </a>
            <a href="/products?category=WOMEN" className="btn-outline">
              Collection Femme
            </a>
            <a href="/products?category=KIDS" className="btn-outline">
              Collection Enfant
            </a>
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
