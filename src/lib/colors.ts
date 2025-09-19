// src/lib/colors.ts

// On NE regroupe pas par palette, on garde les vrais tokens du colorway.
// On déduplique seulement par normalisation (trim + lowercase).

export type SimpleVariant = {
  sku: string;
  size?: string | number | null;
  colorway?: string | null;
  image?: string | null;
  priceCents?: number | null;
  gender?: string | null;
};

export type CanonGroup = {
  id: string; // clé normalisée (ex: "pure platinum")
  display: string; // libellé affiché tel que dans le colorway (ex: "Pure Platinum")
  variants: SimpleVariant[];
  images: Set<string>;
};

export function splitTokens(cw?: string | null): string[] {
  return (cw ?? "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Normalise un token pour servir de clé, mais on affiche le "display" original
function normKey(token: string) {
  return token.trim().toLowerCase();
}

export function groupByCanon(
  variants: SimpleVariant[]
): Map<string, CanonGroup> {
  const groups = new Map<string, CanonGroup>();

  for (const v of variants) {
    const tokens = splitTokens(v.colorway);
    if (!tokens.length) continue;

    for (const original of tokens) {
      const key = normKey(original);
      if (!groups.has(key)) {
        groups.set(key, {
          id: key,
          display: original, // on garde le vrai libellé rencontré
          variants: [],
          images: new Set(),
        });
      }
      const g = groups.get(key)!;
      g.variants.push(v);
      if (v.image) g.images.add(v.image);
    }
  }

  return groups;
}

export function pickGroupImage(g?: CanonGroup): string | undefined {
  if (!g) return undefined;
  if (g.images.size >= 1) return [...g.images][0];
  const withImg = g.variants.find((v) => v.image);
  return withImg?.image ?? undefined;
}
