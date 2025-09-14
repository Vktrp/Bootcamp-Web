import { useState } from "react";
import { API_URL } from "../../lib/utils";
import { SIZE_RANGES } from "../../lib/sizes";

export default function ProductForm() {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("NeoStep");
  const [price, setPrice] = useState(9900);
  const [category, setCategory] = useState<"KIDS" | "WOMEN" | "MEN">("MEN");

  async function submit() {
    const res = await fetch(`${API_URL}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        brand,
        priceCents: price,
        category,
        images: ["/img/placeholder1.jpg"],
      }),
    });
    alert(res.ok ? "Produit créé" : "Erreur");
  }

  return (
    <div className="card max-w-lg space-y-3">
      <h2 className="text-lg font-semibold">Nouveau produit</h2>
      <input
        className="input"
        placeholder="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="input"
        placeholder="Marque"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
      />
      <input
        type="number"
        className="input"
        placeholder="Prix (cents)"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
      />
      <select
        className="input"
        value={category}
        onChange={(e) => setCategory(e.target.value as any)}
      >
        <option value="KIDS">Enfants</option>
        <option value="WOMEN">Femmes</option>
        <option value="MEN">Hommes</option>
      </select>
      <button className="btn" onClick={submit}>
        Créer
      </button>
      <p className="text-xs text-gray-500">
        Les variantes/pointures peuvent être ajoutées côté back (seed) ou via un
        écran dédié.
      </p>
    </div>
  );
}
