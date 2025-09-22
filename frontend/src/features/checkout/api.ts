import { supabase } from "@/lib/supabase";

import type { RootState } from "../../app/store";

import type { SessionUser } from "@/features/auth/api";

/* ---------- Types ---------- */

export type CheckoutPayload = {
  email: string;

  full_name?: string | null;

  address?: string | null;

  // champs carte (démo)

  cardNumber: string;

  cardExp: string; // MM/YY

  cardCvc: string;
};

type CartItem = {
  id?: string | null; // parfois présent

  variant_id?: string | null; // pour lier à product_variant si possible

  name?: string | null;

  size?: string | null;

  size_eu?: string | null;

  qty?: number | null;

  priceCents?: number | null; // certains écrans stockaient en cents

  price?: number | null; // sinon en euros
};

/* ---------- Helpers ---------- */

function eurosFromItem(it: CartItem): number {
  const unit =
    typeof it.priceCents === "number"
      ? Number(it.priceCents) / 100
      : Number(it.price ?? 0);

  return unit * Number(it.qty ?? 1);
}

export function computeCartTotal(items: CartItem[]): number {
  return Number(
    items.reduce((acc, it) => acc + eurosFromItem(it), 0).toFixed(2)
  );
}

// Luhn minimal pour carte (démo front-only)

export function isValidCardNumber(raw: string): boolean {
  const s = raw.replace(/\s+/g, "");

  if (!/^\d{13,19}$/.test(s)) return false;

  let sum = 0,
    dbl = false;

  for (let i = s.length - 1; i >= 0; i--) {
    let d = Number(s[i]);

    if (dbl) {
      d *= 2;

      if (d > 9) d -= 9;
    }

    sum += d;

    dbl = !dbl;
  }

  return sum % 10 === 0;
}

export function isValidExp(mmYY: string): boolean {
  const m = mmYY.match(/^(\d{2})\/(\d{2})$/);

  if (!m) return false;

  const mm = Number(m[1]),
    yy = Number(m[2]);

  if (mm < 1 || mm > 12) return false;

  const now = new Date();

  const y = now.getFullYear() % 100;

  const mNow = now.getMonth() + 1;

  return yy > y || (yy === y && mm >= mNow);
}

export function isValidCvc(cvc: string): boolean {
  return /^\d{3,4}$/.test(cvc);
}

/* ---------- Création de commande (démo : “payée”) ---------- */

export async function createOrderFromCart(
  user: SessionUser | null,

  items: CartItem[],

  input: CheckoutPayload
): Promise<{ orderId: string }> {
  if (!items || items.length === 0) throw new Error("Panier vide.");

  // validations carte (démo)

  if (!isValidCardNumber(input.cardNumber)) throw new Error("Carte invalide.");

  if (!isValidExp(input.cardExp))
    throw new Error("Date d'expiration invalide.");

  if (!isValidCvc(input.cardCvc)) throw new Error("CVC invalide.");

  const total = computeCartTotal(items);

  // 1) Insert order

  const { data: order, error: errOrder } = await supabase

    .from("orders")

    .insert({
      user_id: user?.id ?? null,

      email: input.email,

      full_name: input.full_name ?? null,

      address: input.address ?? null,

      status: "confirmed", // métier : commande confirmée

      payment_status: "paid", // démo : déjà “payée”

      total_amount: total, // en euros (cohérent avec ton Dashboard)
    })

    .select("id")

    .single();

  if (errOrder || !order) throw errOrder || new Error("Création commande KO.");

  // 2) Insert order_items

  const rows = items.map((it) => ({
    order_id: order.id,

    variant_id: it.variant_id ?? it.id ?? null,

    name: it.name ?? null,

    size_eu: it.size_eu ?? it.size ?? null,

    qty: Number(it.qty ?? 1),

    unit_amount: Number(
      typeof it.priceCents === "number"
        ? Number(it.priceCents) / 100
        : it.price ?? 0
    ),
  }));

  const { error: errItems } = await supabase.from("order_items").insert(rows);

  if (errItems) throw errItems;

  return { orderId: order.id as string };
}
