import { API_URL } from "../../lib/utils";
import type { ListResponse, Product } from "./types";

export async function listProducts(
  params: {
    q?: string;
    category?: string;
    size?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  const u = new URL(`${API_URL}/api/products`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}`.length)
      u.searchParams.set(k, String(v));
  });
  const res = await fetch(u.toString());
  if (!res.ok) throw new Error("Failed to load products");
  return (await res.json()) as ListResponse<Product>;
}

export async function getProduct(id: string) {
  const res = await fetch(`${API_URL}/api/products/${id}`);
  if (!res.ok) throw new Error("Product not found");
  return (await res.json()) as Product;
}
