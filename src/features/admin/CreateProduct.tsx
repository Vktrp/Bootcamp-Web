import { useMemo, useState } from "react";
import { createVariants } from "./api";

const SIZES_EU = [
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
];

export default function CreateProduct() {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [silhouette, setSilhouette] = useState("");
  const [gender, setGender] = useState<"MEN" | "WOMEN" | "INFANT" | "UNISEX">(
    "UNISEX"
  );
  const [colorway, setColorway] = useState("");
  const [priceStr, setPriceStr] = useState("");
  const [image, setImage] = useState("");
  const [idModel, setIdModel] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);

  // utils
  const price = Number(priceStr.replace(",", "."));
  const canSubmit = useMemo(
    () =>
      name.trim() &&
      brand.trim() &&
      !Number.isNaN(price) &&
      price > 0 &&
      sizes.length > 0,
    [name, brand, price, sizes]
  );
  const euros = (n?: number) =>
    Number(n ?? 0).toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
    });

  async function submit() {
    const count = await createVariants({
      name: name.trim(),
      brand: brand.trim(),
      silhouette: silhouette.trim() || undefined,
      gender,
      colorway: colorway.trim() || undefined,
      price,
      image: image.trim() || undefined,
      idModel: idModel.trim() || undefined,
      sizes,
    });
    alert(`Créé: ${count} variantes`);
    setSizes([]);
  }

  function toggleSize(s: string) {
    setSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  return (
    <div className="container-page" style={{ maxWidth: 820 }}>
      {/* styles locaux pour “même UI” que le dashboard */}
      <style>{`
        .form-card { padding: 20px; border-radius: 14px; }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px 16px;
        }
        @media (max-width: 860px){ .form-grid { grid-template-columns: 1fr; } }
        .form-field { display: flex; flex-direction: column; }
        .form-label { font-size: 12px; font-weight: 600; opacity: .8; }
        .form-input, .form-select {
          margin-top: 6px;
          height: 44px;
          border-radius: 12px;
        }
        .hint { font-size: 12px; opacity: .7; margin-top: 6px; }
        .sizes-wrap { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .chip {
          padding: 6px 12px; border-radius: 999px; font-weight: 700; font-size: 12px;
          border: 1px solid rgba(255,255,255,.22); opacity: .75;
        }
        .chip.active {
          background: rgba(191,219,254,.12);
          border-color: rgba(191,219,254,.45);
          opacity: 1;
        }
        .summary {
          display:flex; justify-content: space-between; align-items:center;
          padding: 12px 16px; border-radius: 12px; background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.08);
          margin-top: 8px;
        }
      `}</style>

      <h1 className="text-2xl font-semibold mb-4">
        Créer un produit (variantes)
      </h1>

      <div className="card form-card">
        {/* grille: champs “légers” en 2 colonnes */}
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Nom (modèle)</label>
            <input
              className="input form-input"
              placeholder="Air Max 90"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Brand</label>
            <input
              className="input form-input"
              placeholder="Nike, Adidas…"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Silhouette (optionnel)</label>
            <input
              className="input form-input"
              placeholder="Air Max"
              value={silhouette}
              onChange={(e) => setSilhouette(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Gender</label>
            <select
              className="input form-select"
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
            >
              <option value="UNISEX">Unisexe</option>
              <option value="MEN">Homme</option>
              <option value="WOMEN">Femme</option>
              <option value="INFANT">Enfant</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Colorway</label>
            <input
              className="input form-input"
              placeholder="Black/White"
              value={colorway}
              onChange={(e) => setColorway(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Prix (euros)</label>
            <div style={{ position: "relative" }}>
              <input
                className="input form-input"
                type="text"
                inputMode="decimal"
                placeholder="ex: 119.99"
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                style={{ paddingLeft: 46 }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: 10,
                  opacity: 0.7,
                  fontWeight: 700,
                }}
              >
                €
              </span>
            </div>
            <div className="hint">
              {!Number.isNaN(price) && price > 0
                ? euros(price)
                : "Saisis un montant valide"}
            </div>
          </div>

          <div className="form-field" style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">Image (URL)</label>
            <input
              className="input form-input"
              placeholder="https://…"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>

          <div className="form-field" style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">
              ID modèle (optionnel, pour regrouper les variantes)
            </label>
            <input
              className="input form-input"
              placeholder="AM90-2025"
              value={idModel}
              onChange={(e) => setIdModel(e.target.value)}
            />
          </div>
        </div>

        {/* Tailles */}
        <div className="form-field" style={{ marginTop: 10 }}>
          <label className="form-label">Tailles EU</label>
          <div className="sizes-wrap">
            {SIZES_EU.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`chip ${sizes.includes(s) ? "active" : ""}`}
              >
                {s}
              </button>
            ))}
          </div>
          {sizes.length === 0 && (
            <div className="hint">Sélectionne au moins une taille.</div>
          )}
        </div>

        {/* Résumé + CTA (même vibe que les encarts KPI) */}
        <div className="summary">
          <div className="text-sm opacity-80">
            Variantes à créer: <strong>{Math.max(1, sizes.length)}</strong>
            {price > 0 && !Number.isNaN(price)
              ? ` • Prix unitaire ${euros(price)}`
              : ""}
          </div>
          <button className="btn" disabled={!canSubmit} onClick={submit}>
            Créer {Math.max(1, sizes.length)} variante(s)
          </button>
        </div>
      </div>
    </div>
  );
}
