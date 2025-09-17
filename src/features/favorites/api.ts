import { supabase } from "@/lib/supabase";
import { adaptProductCard } from "@/lib/adapters";

const KEY = "fav:ids";

export function getFavoriteIds(): number[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setFavoriteIds(ids: number[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
}

export function toggleFavorite(productId: number) {
  const ids = getFavoriteIds();
  const next = ids.includes(productId)
    ? ids.filter((i) => i !== productId)
    : [...ids, productId];
  setFavoriteIds(next);
  return next;
}

export async function listFavorites() {
  const ids = getFavoriteIds();
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, base_price,
      brands:brands(name),
      product_images(image_url, is_primary, display_order),
      product_variants(price)
    `
    )
    .in("id", ids);

  if (error) throw error;
  return (data ?? []).map(adaptProductCard);
}
