import { useState } from "react";
import { API_URL } from "../../lib/utils";
import { SIZE_RANGES } from "../../lib/sizes";

export default function ProductForm() {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("NeoStep");
  const [price, setPrice] = useState(9900); // en cents
  const [category, setCategory] = useState<"INFANT" | "WOMEN" | "MEN">("MEN");

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
    <div className="container-page" style={{ maxWidth: 720 }}>
      <h1 className="text-xl font-semibold mb-2">Nouveau produit</h1>

      <div className="card" style={{ padding: 16 }}>
        <label>Nom</label>
        <input
          className="input mt-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="mt-3">Marque</label>
        <input
          className="input mt-1"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />

        <label className="mt-3">Prix (cents)</label>
        <input
          className="input mt-1"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />

        <label className="mt-3">Catégorie</label>
        <select
          className="input mt-1"
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
        >
          <option value="MEN">Homme</option>
          <option value="WOMEN">Femme</option>
          <option value="INFANT">Enfant</option>
        </select>

        <button className="btn mt-4" onClick={submit}>
          Créer
        </button>
      </div>
    </div>
  );
}
