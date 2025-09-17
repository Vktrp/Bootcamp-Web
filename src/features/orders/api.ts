import { supabase } from "../../lib/supabase";

// ---- Types attendus par l'UI (on garde les mêmes signatures/exports) ----
export type OrderLike = {
  id: string;
  status?: string;
  amountCents?: number; // map depuis total_amount (euros) -> cents
  createdAt?: string; // map depuis created_at
};

export type OrderItemLike = {
  productVariantId?: string;
  quantity?: number;
  unitPriceCents?: number; // map depuis unit_price (euros) -> cents
  totalPriceCents?: number; // map depuis total_price (euros) -> cents
};

export type OrderDetail = OrderLike & {
  orderNumber?: string;
  items?: OrderItemLike[];
  shippingAddress?: string | null;
  billingAddress?: string | null;
  paymentMethod?: string | null;
};

// ---- Helpers ----
const eurosToCents = (v: any) =>
  v == null ? undefined : Math.round(Number(v) * 100);

// ---- API ----

// Liste des commandes de l'utilisateur connecté
export async function listMyOrders(): Promise<OrderLike[]> {
  // qui est connecté ?
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return []; // pas connecté => pas de commandes

  // ta table "orders" (d'après tes captures) contient : id, user_id, status,
  // total_amount (euros), created_at, etc.
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total_amount, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((r: any) => ({
    id: String(r.id),
    status: r.status ?? undefined,
    amountCents: eurosToCents(r.total_amount),
    createdAt: r.created_at ?? undefined,
  }));
}

// Détail d'une commande
export async function getOrder(id: string): Promise<OrderDetail> {
  const { data: header, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, total_amount, created_at, shipping_address, billing_address, payment_method"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !header) {
    throw new Error("Commande introuvable");
  }

  // items reliés (d'après ton schéma: table order_items)
  const { data: items, error: itemsErr } = await supabase
    .from("order_items")
    .select("product_variant_id, quantity, unit_price, total_price")
    .eq("order_id", header.id);

  if (itemsErr) {
    // on n'échoue pas la page pour autant
    // (tu verras juste "0 items" si la jointure échoue)
    // console.error("[orders] items error:", itemsErr);
  }

  return {
    id: String(header.id),
    orderNumber: header.order_number ?? undefined,
    status: header.status ?? undefined,
    amountCents: eurosToCents(header.total_amount),
    createdAt: header.created_at ?? undefined,
    shippingAddress: header.shipping_address ?? null,
    billingAddress: header.billing_address ?? null,
    paymentMethod: header.payment_method ?? null,
    items: (items ?? []).map((it: any) => ({
      productVariantId: it.product_variant_id ?? undefined,
      quantity: it.quantity ?? undefined,
      unitPriceCents: eurosToCents(it.unit_price),
      totalPriceCents: eurosToCents(it.total_price),
    })),
  };
}
