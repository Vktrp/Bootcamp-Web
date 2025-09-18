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
  const [brand, setBrand] = useState(""); // ← plus de valeur par défaut
  const [silhouette, setSilhouette] = useState("");
  const [gender, setGender] = useState<"MEN" | "WOMEN" | "INFANT" | "UNISEX">(
    "UNISEX"
  );
  const [colorway, setColorway] = useState("");
  const [priceStr, setPriceStr] = useState(""); // ← string pour gérer input vide
  const [image, setImage] = useState("");
  const [idModel, setIdModel] = useState<string>("");
  const [sizes, setSizes] = useState<string[]>([]);

  const price = Number(priceStr.replace(",", ".")); // support virgule
  const canSubmit = useMemo(
    () =>
      name.trim() &&
      brand.trim() &&
      !Number.isNaN(price) &&
      price > 0 &&
      sizes.length > 0,
    [name, brand, price, sizes]
  );

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
    // reset soft
    setSizes([]);
    // on garde les autres champs pour enchaîner si besoin
  }

  function toggleSize(s: string) {
    setSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  return (
    <div className="container-page" style={{ maxWidth: 720 }}>
      <h1 className="text-xl font-semibold mb-2">
        Créer un produit (variantes)
      </h1>

      <div className="card p-4 space-y-3">
        <div>
          <label>Nom (modèle)</label>
          <input
            className="input mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Air Max 90"
          />
        </div>

        <div>
          <label>Brand</label>
          <input
            className="input mt-1"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Nike, Adidas…"
          />
        </div>

        <div>
          <label>Silhouette (optionnel)</label>
          <input
            className="input mt-1"
            value={silhouette}
            onChange={(e) => setSilhouette(e.target.value)}
            placeholder="Air Max"
          />
        </div>

        <div>
          <label>Gender</label>
          <select
            className="input mt-1"
            value={gender}
            onChange={(e) => setGender(e.target.value as any)}
          >
            <option value="UNISEX">Unisexe</option>
            <option value="MEN">Homme</option>
            <option value="WOMEN">Femme</option>
            <option value="INFANT">Enfant</option>
          </select>
        </div>

        <div>
          <label>Colorway</label>
          <input
            className="input mt-1"
            value={colorway}
            onChange={(e) => setColorway(e.target.value)}
            placeholder="Black/White"
          />
        </div>

        <div>
          <label>Prix (euros)</label>
          <input
            className="input mt-1"
            type="text"
            inputMode="decimal"
            placeholder="ex: 119.99"
            value={priceStr}
            onChange={(e) => setPriceStr(e.target.value)}
          />
        </div>

        <div>
          <label>Image (URL)</label>
          <input
            className="input mt-1"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://…"
          />
        </div>

        <div>
          <label>ID modèle (optionnel, pour regrouper les variantes)</label>
          <input
            className="input mt-1"
            value={idModel}
            onChange={(e) => setIdModel(e.target.value)}
            placeholder="AM90-2025"
          />
        </div>

        <div>
          <label>Tailles EU</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {SIZES_EU.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`px-3 py-1 rounded-full border ${
                  sizes.includes(s) ? "bg-white text-black" : "opacity-60"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {sizes.length === 0 && (
            <div className="text-xs opacity-70 mt-1">
              Sélectionne au moins une taille.
            </div>
          )}
        </div>

        <button className="btn mt-2" disabled={!canSubmit} onClick={submit}>
          Créer {Math.max(1, sizes.length)} variante(s)
        </button>
      </div>
    </div>
  );
}
