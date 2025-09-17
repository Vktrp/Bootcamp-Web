// utils de conversion + mapping de tes tables vers ce que l'UI attend
export const toNumber = (x: unknown) => (x == null ? 0 : Number(x));
export const toCents = (x: unknown) => Math.round(toNumber(x) * 100);

type ImageRow = {
  image_url?: string | null;
  is_primary?: boolean | null;
  display_order?: number | null;
};

export function pickPrimaryImage(images?: ImageRow[] | null) {
  if (!images || images.length === 0) return null;
  const primary = images.find((i) => i.is_primary);
  if (primary?.image_url) return primary.image_url;
  return (
    [...images]
      .sort((a, b) => toNumber(a.display_order) - toNumber(b.display_order))
      .find((i) => i.image_url)?.image_url ?? null
  );
}

export function minVariantPrice(
  variants?: { price?: string | number | null }[] | null
) {
  if (!variants || variants.length === 0) return null;
  const nums = variants
    .map((v) => toNumber(v.price))
    .filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return null;
  return Math.min(...nums);
}

/** Card produit standardisée pour la grille */
export function adaptProductCard(row: any) {
  // brand peut arriver sous forme nested (brand: {name}) ou flat (brand_name si tu l’ajoutes côté select)
  const brand =
    row.brand?.name ??
    row.brands?.name ?? // selon nom auto du join
    row.brand_name ??
    null;

  const price =
    minVariantPrice(row.product_variants) ?? toNumber(row.base_price);
  return {
    id: row.id,
    name: row.name,
    brand,
    priceCents: toCents(price),
    image: pickPrimaryImage(row.product_images),
  };
}

/** Détail produit plus complet */
export function adaptProductDetail(row: any) {
  const card = adaptProductCard(row);
  return {
    ...card,
    description: row.description ?? "",
    sku: row.sku ?? null,
    variants: (row.product_variants ?? []).map((v: any) => ({
      sku: v.sku,
      size: toNumber(v.size),
      color: v.color ?? null,
      stock: toNumber(v.stock_quantity),
      priceCents: toCents(v.price ?? row.base_price),
    })),
    images: (row.product_images ?? [])
      .map((i: any) => i.image_url)
      .filter(Boolean),
  };
}

/** Commande -> liste */
export function adaptOrderRow(r: any) {
  return {
    id: r.id,
    orderNumber: r.order_number ?? r.id,
    status: r.status ?? "pending",
    amountCents: toCents(r.total_amount),
    createdAt: r.created_at,
  };
}
