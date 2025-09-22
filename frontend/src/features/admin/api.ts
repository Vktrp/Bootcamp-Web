// frontend/src/features/admin/api.ts

import { supabase } from "@/lib/supabase";

import { API_URL } from "@/lib/utils";

import { getToken } from "@/features/auth/api";

// ---------- KPIs ----------

export type Kpis = {
  products: number;

  variants: number;

  orders7d: number;

  users: number;
};

async function countExact(table: string, where?: (q: any) => any) {
  let q: any = supabase.from(table).select("*", { count: "exact", head: true });

  if (where) q = where(q);

  const { count, error } = await q;

  return error || typeof count !== "number" ? 0 : count!;
}

export async function fetchKpis(): Promise<Kpis> {
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 3600 * 1000
  ).toISOString();

  let products = await countExact("product").catch(() => 0);

  if (!products) {
    const { data } = await supabase

      .from("product_variant")

      .select("id_model")

      .not("id_model", "is", null);

    products = data
      ? new Set((data as any[]).map((d: any) => d.id_model)).size
      : 0;
  }

  const variants = await countExact("product_variant");

  const orders7d = await countExact("orders", (q) =>
    q.gte("created_at", sevenDaysAgo)
  );

  const users = await countExact("users");

  return { products, variants, orders7d, users };
}

// ---------- Recent orders ----------

export type RecentOrder = {
  id: string;

  status: string | null;

  payment_status: string | null;

  total_amount: number | null; // euros

  created_at: string;
};

export async function fetchRecentOrders(): Promise<RecentOrder[]> {
  const { data, error } = await supabase

    .from("orders")

    .select("id, status, payment_status, total_amount, created_at")

    .order("created_at", { ascending: false })

    .limit(5);

  return error || !data ? [] : (data as any);
}

// ---------- Stock / Inventory ----------

export type StockRow = {
  variant_id: string;

  sku: string | null;

  name: string | null;

  size_eu: string | null;

  stock: number;
};

export async function countVariants(): Promise<number> {
  return await countExact("product_variant");
}

export async function listStock(limit = 50, offset = 0): Promise<StockRow[]> {
  const { data: variants, error: errV } = await supabase

    .from("product_variant")

    .select("variant_id, sku, name, size_eu")

    .order("variant_id")

    .range(offset, offset + limit - 1);

  if (errV || !variants) return [];

  const ids = (variants as any[]).map((v) => v.variant_id);

  const { data: inv } = await supabase

    .from("inventory")

    .select("variant_id, quantity")

    .in("variant_id", ids);

  const byId: Record<string, number> = {};

  if (inv)
    for (const it of inv as any[])
      byId[it.variant_id] = Number(it.quantity ?? 0);

  return (variants as any[]).map((v) => ({
    variant_id: v.variant_id,

    sku: v.sku ?? null,

    name: v.name ?? null,

    size_eu: v.size_eu ?? null,

    stock: byId[v.variant_id] ?? 0,
  }));
}

export async function adjustInventory(variant_id: string, delta: number) {
  const { data } = await supabase

    .from("inventory")

    .select("quantity")

    .eq("variant_id", variant_id)

    .maybeSingle();

  const next = Number(data?.quantity ?? 0) + delta;

  await supabase

    .from("inventory")

    .upsert({ variant_id, quantity: next }, { onConflict: "variant_id" });

  return next;
}

// ---------- Product creation (variants) ----------

export type CreateVariantInput = {
  name: string;

  brand: string;

  silhouette?: string;

  gender: "MEN" | "WOMEN" | "INFANT" | "UNISEX";

  colorway?: string;

  price: number; // euros

  image?: string | null;

  idModel?: string;

  sizes: string[]; // EU sizes
};

function randomId() {
  return "VAR-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function createVariants(input: CreateVariantInput) {
  const rows = input.sizes.map((size) => {
    const variant_id = randomId();

    const sku = [
      input.brand?.slice(0, 3)?.toUpperCase() ?? "BRD",

      size,

      Date.now().toString().slice(-5),
    ].join("-");

    return {
      variant_id,

      id_model: input.idModel || input.name,

      brand: input.brand,

      silhouette: input.silhouette || input.name,

      gender: input.gender,

      colorway: input.colorway ?? null,

      name: input.name,

      sku,

      size_eu: size,

      image: input.image || null,

      retailPrice: input.price,
    };
  });

  const { error } = await supabase.from("product_variant").insert(rows);

  if (error) throw error;

  return rows.length;
}

// ---------- Users ----------


 export type Role = "admin" | "seller" | "customer";

 export type UserRow = {

  id: string | number;

  email: string | null;

  first_name: string | null;

  last_name: string | null;

  role: string | null;

  is_active: boolean | null;

  created_at: string | null;

 };

export async function listUsers(limit = 50, offset = 0): Promise<UserRow[]> {
  const { data, error } = await supabase

    .from("users")

    .select("id, email, first_name, last_name, role, is_active, created_at")

    .order("created_at", { ascending: false })

    .range(offset, offset + limit - 1);

  return error || !data ? [] : (data as any[]);
}

/** UPDATE via backend (évite RLS/anon) */

export async function updateUser(

  id: number | string,

  patch: { role?: Role; is_active?: boolean }

 ): Promise<UserRow> {

  const userId = typeof id === "string" ? Number(id) : id; // l’API attend un int

  const res = await fetch(`${API_URL}/admin/users/${userId}`, {

    method: "PATCH",

    headers: {

      "Content-Type": "application/json",

      Authorization: `Bearer ${getToken() || ""}`,

    },

    body: JSON.stringify(patch),

  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data?.message || "Erreur serveur");

  return data as UserRow;

 }