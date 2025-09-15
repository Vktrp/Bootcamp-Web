// src/features/orders/api.ts
import { supabase } from "@/lib/supabase";

/** Liste des commandes de l'utilisateur connecté */
export async function listMyOrders() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("id, total_cents, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((o) => ({
    id: o.id,
    amountCents: o.total_cents,
    status: o.status ?? "paid",
    createdAt: o.created_at,
  }));
}

/** Détail d'une commande (seulement si elle appartient au user courant via RLS) */
export async function getOrder(orderId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non connecté");

  const { data, error } = await supabase
    .from("orders")
    .select("id, total_cents, status, created_at")
    .eq("id", orderId)
    .single();

  // Si RLS bloque ou id invalide, data sera null
  if (error) throw error;
  if (!data) throw new Error("Commande introuvable");

  return {
    id: data.id,
    amountCents: data.total_cents,
    status: data.status ?? "paid",
    createdAt: data.created_at,
  };
}
