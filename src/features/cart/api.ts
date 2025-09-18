// src/features/cart/api.ts
import { supabase } from "../../lib/supabase";

export async function addToCartRemote(variantId: string, qty = 1) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // upsert: si existe on incrémente
  const { data, error } = await supabase
    .from("shopping_carts")
    .upsert(
      { user_id: user.id, product_variant_id: variantId, quantity: qty },
      { onConflict: "user_id,product_variant_id" }
    )
    .select();

  if (error) throw error;
  return data;
}

export async function setCartItemQtyRemote(variantId: string, qty: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (qty <= 0) {
    const { error } = await supabase
      .from("shopping_carts")
      .delete()
      .eq("user_id", user.id)
      .eq("product_variant_id", variantId);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("shopping_carts")
    .update({ quantity: qty })
    .eq("user_id", user.id)
    .eq("product_variant_id", variantId);
  if (error) throw error;
}

export async function fetchCartRemote() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("shopping_carts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
