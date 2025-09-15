// src/features/favorites/api.ts
import { supabase } from "../../lib/supabase"; // ou ../../lib/supabase si tu n'as pas l'alias "@"

// Le type que ta page utilise
export type FavoriteProduct = {
  id: string | number;
  name: string;
  brand?: string;
  image?: string;
  priceCents?: number;
};

/**
 * Récupère les favoris de l'utilisateur connecté depuis Supabase.
 * Schéma attendu côté DB :
 * - table "favorites" avec user_id, product_id
 * - table "products" avec id, name, brand, image, price_cents
 * Et une FK favorites.product_id -> products.id
 */
export async function listFavorites(): Promise<FavoriteProduct[]> {
  // Qui est connecté ?
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return [];

  // Jointure Supabase : on récupère le produit lié à chaque favori
  const { data, error } = await supabase
    .from("favorites")
    .select(
      `
      id,
      product:products(
        id,
        name,
        brand,
        image,
        price_cents
      )
    `
    )
    .eq("user_id", userId)
    .order("id", { ascending: false });

  if (error) {
    console.error("[favorites] listFavorites error:", error);
    return [];
  }

  // Mise en forme pour la page
  return (data ?? [])
    .map((row: any) => row.product)
    .filter(Boolean)
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      brand: p.brand ?? undefined,
      image: p.image ?? undefined,
      priceCents: p.price_cents ?? undefined,
    }));
}
