import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "./api";
import { formatPrice } from "../../lib/utils";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addItem } from "../cart/slice";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: p,
    isLoading,
    error,
  } = useQuery({ queryKey: ["product", id], queryFn: () => getProduct(id!) });
  const [sku, setSku] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const dispatch = useDispatch();

  if (isLoading) return <p>Chargement…</p>;
  if (error || !p) return <p>Introuvable.</p>;

  const v = p.variants.find((v) => v.sku === sku);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <img
          src={p.images?.[0] || "https://via.placeholder.com/800x600"}
          alt={p.name}
          className="w-full rounded-2xl"
        />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{p.name}</h1>
        <p className="text-gray-600">{p.brand}</p>
        <p className="mt-2 text-xl font-semibold">
          {formatPrice(p.priceCents)}
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm">Pointure</label>
            <select
              className="input"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            >
              <option value="">Choisir…</option>
              {p.variants.map((variant) => (
                <option
                  key={variant.sku}
                  value={variant.sku}
                  disabled={variant.stock <= 0}
                >
                  EU {variant.sizeEU}{" "}
                  {variant.stock <= 0
                    ? "(Rupture)"
                    : `(Stock: ${variant.stock})`}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Quantité</label>
            <input
              type="number"
              min={1}
              className="input w-24"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            />
          </div>
          <button
            className="btn"
            disabled={!sku}
            onClick={() => {
              if (!v) return;
              dispatch(
                addItem({
                  productId: p.id,
                  variantSKU: v.sku,
                  qty,
                  priceCents: p.priceCents,
                })
              );
            }}
          >
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}
