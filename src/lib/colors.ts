// src/lib/colors.ts

// 1) Dictionnaire de synonymes → token canonique
// Ajoute/édite librement ici selon ta base.
export const CANON: Record<string, string> = {
  white: "White",
  "off white": "White",
  "summit white": "White",
  "photon white": "White",
  sail: "White",

  black: "Black",
  "triple black": "Black",

  "dark grey": "Grey",
  "wolf grey": "Grey",
  "cool grey": "Grey",
  grey: "Grey",

  blue: "Blue",
  navy: "Blue",
  "midnight navy": "Blue",
  "racer blue": "Blue",
  "photo blue": "Blue",
  "radiant blue": "Blue",

  // ajoute d’autres mappings ici…
};

export const PRETTY_LABEL: Record<string, string> = {
  // clef en minuscule → label joli
  white: "White",
  black: "Black",
  grey: "Grey",
  blue: "Blue",
};

// Helpers
export function splitTokens(cw?: string | null): string[] {
  return (cw ?? "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function canonToken(raw: string): string {
  const k = raw.toLowerCase();
  // si connu → retourne label canon (ex: "White"), sinon conserve l’original trim
  return CANON[k] ?? raw.trim();
}

// Type minimal de variante (on ne dépend pas de tes types exacts)
export type SimpleVariant = {
  sku: string;
  size?: string | number | null;
  colorway?: string | null;
  image?: string | null;
  priceCents?: number | null;
};

export type CanonGroup = {
  id: string; // identifiant canon (ex: "White")
  display: string; // libellé affiché (ex: "White")
  variants: SimpleVariant[];
  images: Set<string>; // URLs des images distinctes
};

// Construit les groupes canoniques à partir des variantes
export function groupByCanon(
  variants: SimpleVariant[]
): Map<string, CanonGroup> {
  const groups = new Map<string, CanonGroup>();
  for (const v of variants) {
    const tokens = splitTokens(v.colorway);
    if (!tokens.length) continue;
    for (const t of tokens) {
      const canon = canonToken(t);
      const key = canon.toLowerCase();
      if (!groups.has(key)) {
        const display = PRETTY_LABEL[key] ?? canon;
        groups.set(key, {
          id: canon,
          display,
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

// Choisit l’image “représentative” du groupe
export function pickGroupImage(g?: CanonGroup): string | undefined {
  if (!g) return undefined;
  // 1) si au moins 1 image distincte → prends la première
  if (g.images.size >= 1) return [...g.images][0];
  // 2) sinon, cherche une variante avec image
  const withImg = g.variants.find((v) => v.image);
  if (withImg?.image) return withImg.image;
  // 3) sinon, pas d’image de groupe
  return undefined;
}
