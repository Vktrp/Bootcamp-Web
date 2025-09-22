// frontend/src/features/checkout/api.ts

 import type { CartItem } from "@/features/cart/slice";

 // Utilise VITE_API_URL si défini, sinon fallback local

 const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

 export type CreateOrderItem = {

  sku: string;

  size: string | null;

  qty: number;

  priceCents: number;

 };

 export type CreateOrderPayload = {

  items: CartItem[];

  shippingAddress?: string | null;

  paymentMethod?: string | null; // ex: "Credit Card"

 };

 export type CreateOrderResponse = {

  orderId: number; // renvoyé par le backend /checkout/pay

 };

 /**

 * Transforme le panier Redux -> format attendu par le backend

 */

 function normalizeItems(items: CartItem[]): CreateOrderItem[] {

  return (items || []).map((it) => ({

    sku: it.sku,

    size: it.size ?? null,

    qty: it.qty,

    priceCents: it.priceCents ?? 0,

  }));

 }

 /**

 * Appelle le backend pour créer la commande, insérer items,

 * décrémenter le stock, puis renvoie l'id de commande.

 * Endpoint côté back: POST /checkout/pay

 */

 export async function createOrderFromCart(

  payload: CreateOrderPayload

 ): Promise<CreateOrderResponse> {

  const body = {

    items: normalizeItems(payload.items),

    shipping_address: payload.shippingAddress ?? null,

    payment_method: payload.paymentMethod ?? "Credit Card",

  };

  const res = await fetch(`${API_BASE}/checkout/pay`, {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify(body),

  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {

    const msg =

      data?.message ||

      data?.error ||

      `${res.status} ${res.statusText}` ||

      "Échec création commande";

    throw new Error(msg);

  }

  return data as CreateOrderResponse;

 }