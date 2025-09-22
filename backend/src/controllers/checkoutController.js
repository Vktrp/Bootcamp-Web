// backend/src/controllers/checkoutController.js

import supabase from "../lib/supabase.js";

function euros(n) {
  return Number((n ?? 0).toFixed(2));
}

/**

 * “Paiement” fake :

 * - crée une ligne dans `orders`

 * - crée les lignes dans `order_items`

 * - décrémente le stock dans `inventory`

 *

 * Body attendu:

 * {

 *   items: [{ sku, qty, priceCents, size? }],

 *   shipping_address?: string | null,

 *   payment_method?: string

 * }

 */

export async function createOrder(req, res) {
  try {
    const {
      items = [],

      shipping_address = null,

      payment_method = "Credit Card",
    } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Panier vide." });
    }

    const totalCents = items.reduce(
      (s, it) => s + Number(it.priceCents || 0) * Number(it.qty || 0),

      0
    );

    const total_amount = euros(totalCents / 100);

    const order_number = "ORD-" + Math.floor(1000 + Math.random() * 9000);

    // 1) Créer la commande

    const { data: order, error: e1 } = await supabase

      .from("orders")

      .insert({
        order_number,

        status: "confirmed",

        payment_status: "paid",

        total_amount,

        shipping_address,

        billing_address: shipping_address,

        payment_method,
      })

      .select("id")

      .single();

    if (e1) return res.status(400).json({ message: e1.message });

    const orderId = order.id;

    // 2) Items + décrément du stock

    for (const it of items) {
      // retrouver le variant à partir du SKU

      const { data: variantRow, error: eV } = await supabase

        .from("product_variant")

        .select("variant_id")

        .eq("sku", it.sku)

        .maybeSingle();

      if (eV || !variantRow) continue; // on skip si introuvable

      const variant_id = variantRow.variant_id;

      const unit_price = euros((it.priceCents ?? 0) / 100);

      const total_price = euros(unit_price * (it.qty ?? 0));

      // a) order_items

      await supabase.from("order_items").insert({
        order_id: orderId,

        product_variant_id: variant_id,

        quantity: it.qty ?? 1,

        unit_price,

        total_price,
      });

      // b) stock

      const { data: inv } = await supabase

        .from("inventory")

        .select("quantity")

        .eq("variant_id", variant_id)

        .maybeSingle();

      const nextQty = Math.max(
        0,

        Number(inv?.quantity ?? 0) - Number(it.qty ?? 0)
      );

      await supabase

        .from("inventory")

        .upsert(
          { variant_id, quantity: nextQty },
          { onConflict: "variant_id" }
        );
    }

    return res.json({ orderId });
  } catch (e) {
    console.error("createOrder error", e);

    return res.status(500).json({ message: "Erreur serveur." });
  }
}

// alias pour compat avec un import existant

export const payAndSave = createOrder;

// (facultatif) export par défaut pratique

export default { createOrder, payAndSave };
