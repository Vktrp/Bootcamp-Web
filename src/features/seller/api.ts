// src/features/seller/api.ts
import { supabase } from "@/lib/supabase";

export type SellerStats = {
  soldPairs: number;
  revenueCents: number;
};

export type OrderRow = {
  id: string;
  order_number: string | null;
  status: string | null;
  payment_status: string | null;
  created_at: string | null;
  total_amount: number | null; // euros (numeric)
};

export type OrderItemRow = {
  order_id: string;
  product_variant_id: string;
  quantity: number;
  unit_price: number; // euros
  total_price: number; // euros
  created_at: string | null;
};

export type VariantRow = {
  variant_id: string;
  name: string | null;
  sku: string | null;
  size_eu: string | null;
  colorway: string | null;
  image?: string | null;
};

export type OrderView = {
  order: OrderRow;
  lines: Array<{ item: OrderItemRow; variant?: VariantRow }>;
  totalCents: number;
};

// Stats basées sur les commandes payées (payment_status = 'paid')
export async function getStoreStats(): Promise<SellerStats> {
  const { data: orders, error: errOrders } = await supabase
    .from("orders")
    .select("id, payment_status, total_amount");

  if (errOrders || !orders) return { soldPairs: 0, revenueCents: 0 };

  const paidOrders = orders.filter(
    (o: any) => (o?.payment_status ?? "").toLowerCase() === "paid"
  );
  const paidOrderIds = paidOrders.map((o: any) => o.id);

  const revenueCents = paidOrders.reduce((sum: number, o: any) => {
    const euros = Number(o?.total_amount ?? 0);
    return sum + Math.round(euros * 100);
  }, 0);

  let soldPairs = 0;
  if (paidOrderIds.length > 0) {
    const { data: items } = await supabase
      .from("order_items")
      .select("order_id, quantity")
      .in("order_id", paidOrderIds);

    if (items) {
      soldPairs = items.reduce(
        (n: number, it: any) => n + Number(it?.quantity ?? 0),
        0
      );
    }
  }

  return { soldPairs, revenueCents };
}

// Commandes récentes + items + variants (assemblage côté client)
export async function getRecentOrders(limit = 20): Promise<OrderView[]> {
  const { data: orders, error: errOrders } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_status, created_at, total_amount"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (errOrders || !orders || orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const { data: items, error: errItems } = await supabase
    .from("order_items")
    .select(
      "order_id, product_variant_id, quantity, unit_price, total_price, created_at"
    )
    .in("order_id", orderIds);

  const itemsArr: OrderItemRow[] = errItems || !items ? [] : (items as any);

  const variantIds = Array.from(
    new Set(itemsArr.map((i) => i.product_variant_id))
  );
  let variantsMap: Record<string, VariantRow> = {};
  if (variantIds.length > 0) {
    const { data: variants } = await supabase
      .from("product_variant")
      .select("variant_id, name, sku, size_eu, colorway, image")
      .in("variant_id", variantIds);
    if (variants) {
      variantsMap = Object.fromEntries(
        (variants as any[]).map((v) => [v.variant_id, v as VariantRow])
      );
    }
  }

  const byOrder: Record<string, OrderItemRow[]> = {};
  for (const it of itemsArr) {
    (byOrder[it.order_id] ??= []).push(it);
  }

  return orders.map((o) => {
    const lines = (byOrder[o.id] ?? []).map((it) => ({
      item: it,
      variant: variantsMap[it.product_variant_id],
    }));
    const totalFromItems = lines.reduce(
      (s, l) =>
        s +
        Math.round(
          (l.item.total_price ?? l.item.unit_price * l.item.quantity) * 100
        ),
      0
    );
    const fallback = Math.round(Number(o.total_amount ?? 0) * 100);
    return { order: o as any, lines, totalCents: totalFromItems || fallback };
  });
}
