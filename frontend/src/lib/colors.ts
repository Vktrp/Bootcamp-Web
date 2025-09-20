// src/lib/colors.ts

export type SimpleVariant = {
  sku: string;
  size?: string | number | null;
  colorway?: string | null;
  image?: string | null;
  priceCents?: number | null;
  gender?: string | null;
};

export type CanonGroup = {
  id: string; // ex: "pink", "black"
  display: string; // ex: "Pink", "Black"
  variants: SimpleVariant[];
  images: Set<string>;
  bestImage?: string;
};

// ---------- helpers ----------
function splitTokens(cw?: string | null): string[] {
  return (cw ?? "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
}
const lower = (s: string) => s.toLowerCase();

// Liste de buckets + regex de détection
type Bucket = {
  id: string;
  display: string;
  rx: RegExp;
};
const BUCKETS: Bucket[] = [
  {
    id: "black",
    display: "Black",
    rx: /\b(black|noir|anthracite|obsidian|graphite|dark\s*k?night|jet|ink)\b/i,
  },
  {
    id: "white",
    display: "White",
    rx: /\b(white|blanc|sail|off[-\s]?white|cream|ivory|bone|platinum|pure\s*platinum)\b/i,
  },
  {
    id: "grey",
    display: "Grey",
    rx: /\b(grey|gray|gris|wolf\s*grey|cool\s*grey|smoke|smokey|ash|silver)\b/i,
  },
  {
    id: "pink",
    display: "Pink",
    rx: /\b(pink|rose|fuchsia|magenta|foam\s*pink|arctic\s*punch|laser\s*pink|hyper\s*pink|photo\s*pink)\b/i,
  },
  {
    id: "red",
    display: "Red",
    rx: /\b(red|rouge|crimson|maroon|burgundy|infrared|team\s*red|university\s*red)\b/i,
  },
  {
    id: "orange",
    display: "Orange",
    rx: /\b(orange|volt\s*orange|total\s*orange|rust|copper)\b/i,
  },
  {
    id: "yellow",
    display: "Yellow",
    rx: /\b(yellow|jaune|maize|sun|sulfur|electric\s*yellow|lemon|ochre|gold)\b/i,
  },
  {
    id: "green",
    display: "Green",
    rx: /\b(green|vert|olive|forest|pine|neon\s*green|aqua|mint|lime)\b/i,
  },
  {
    id: "blue",
    display: "Blue",
    rx: /\b(blue|bleu|royal|navy|azure|cyan|turquoise|teal|aqua|cerulean|racer\s*blue|photo\s*blue|summit\s*white\/(obsidian|blue))\b/i,
  },
  {
    id: "purple",
    display: "Purple",
    rx: /\b(purple|violet|lilac|plum|eggplant|grape|amethyst)\b/i,
  },
  {
    id: "brown",
    display: "Brown",
    rx: /\b(brown|marron|tan|mocha|chocolate|cacao|bronze)\b/i,
  },
  {
    id: "beige",
    display: "Beige",
    rx: /\b(beige|sail|sand|taupe|khaki|cream)\b/i,
  },
  // “multi” si on détecte des indices clairs
  {
    id: "multi",
    display: "Multi",
    rx: /\b(multicolor|multi[-\s]?color|rainbow|what\s*the)\b/i,
  },
];

// Ordre de priorité si plusieurs buckets matchent le même token
const BUCKET_PRIORITY = [
  "multi",
  "black",
  "white",
  "grey",
  "pink",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "brown",
  "beige",
];

// essaie d’attribuer un token à un bucket
function bucketForToken(token: string): Bucket | undefined {
  for (const b of BUCKETS) {
    if (b.rx.test(token)) return b;
  }
  return undefined;
}

// score pour choisir une image par groupe
function scoreImage(
  url: string,
  bucketId: string,
  globalFreq: Map<string, number>
) {
  const freq = globalFreq.get(url) ?? 0;
  // favorise l’URL contenant le nom du bucket (ex: "...pink...")
  const contains = new RegExp(
    `\\b${bucketId.replace(/\s+/g, ".*")}\\b`,
    "i"
  ).test(url);
  return { freq, contains, len: url.length };
}

// ---------- API ----------
export function groupByCanon(
  variants: SimpleVariant[]
): Map<string, CanonGroup> {
  // 1) créer groupes bucketisés
  const groups = new Map<string, CanonGroup>();
  const globalFreq = new Map<string, number>(); // fréquence d’utilisation de chaque image (sur tous buckets)
  const imageToGroups = new Map<string, Set<string>>();

  for (const v of variants) {
    const tokens = splitTokens(v.colorway);
    if (!tokens.length) continue;

    // chaque token → bucket ; déduplique les buckets par variante
    const matchedBucketIds = new Set<string>();
    for (const raw of tokens) {
      const token = lower(raw);
      const bucket =
        bucketForToken(token) ||
        // fallback heuristique basique par couleurs courantes si aucune regex n’a matché
        (/\bpink|rose\b/.test(token)
          ? BUCKETS.find((b) => b.id === "pink")
          : /\bblack|noir\b/.test(token)
          ? BUCKETS.find((b) => b.id === "black")
          : /\bwhite|blanc|sail\b/.test(token)
          ? BUCKETS.find((b) => b.id === "white")
          : /\bgrey|gray|gris\b/.test(token)
          ? BUCKETS.find((b) => b.id === "grey")
          : /\bblue|bleu\b/.test(token)
          ? BUCKETS.find((b) => b.id === "blue")
          : /\bred|rouge\b/.test(token)
          ? BUCKETS.find((b) => b.id === "red")
          : /\bgreen|vert\b/.test(token)
          ? BUCKETS.find((b) => b.id === "green")
          : /\byellow|jaune|maize\b/.test(token)
          ? BUCKETS.find((b) => b.id === "yellow")
          : undefined);

      if (!bucket) continue;
      matchedBucketIds.add(bucket.id);
    }

    // si aucun bucket détecté pour la variante, on abandonne juste cette variante
    if (matchedBucketIds.size === 0) continue;

    for (const bucketId of matchedBucketIds) {
      const bucketMeta = BUCKETS.find((b) => b.id === bucketId)!;
      if (!groups.has(bucketId)) {
        groups.set(bucketId, {
          id: bucketMeta.id,
          display: bucketMeta.display,
          variants: [],
          images: new Set(),
        });
      }
      const g = groups.get(bucketId)!;
      g.variants.push(v);
      if (v.image) {
        const url = String(v.image);
        if (!g.images.has(url)) {
          g.images.add(url);
          globalFreq.set(url, (globalFreq.get(url) ?? 0) + 1);
          if (!imageToGroups.has(url)) imageToGroups.set(url, new Set());
          imageToGroups.get(url)!.add(bucketId);
        }
      }
    }
  }

  // 2) assignation d’une image par groupe
  const assigned = new Set<string>();

  // a) images “uniques” (utilisées par un seul bucket) réservées d’office
  for (const [url, set] of imageToGroups.entries()) {
    if (set.size === 1) {
      const onlyKey = [...set][0];
      const g = groups.get(onlyKey);
      if (g && !g.bestImage) {
        g.bestImage = url;
        assigned.add(url);
      }
    }
  }

  // b) pour les autres : choisir la moins partagée, qui ressemble le plus au bucket
  const pending = [...groups.values()].filter((g) => !g.bestImage);
  // les groupes qui ont le moins de choix d’images passent d’abord
  pending.sort((a, b) => a.images.size - b.images.size);

  for (const g of pending) {
    const candidates = [...g.images]
      .filter((url) => !assigned.has(url))
      .map((url) => ({ url, ...scoreImage(url, g.id, globalFreq) }));

    if (candidates.length === 0) {
      // tout est pris : on retombe sur la “moins partagée” même si déjà assignée
      const fb = [...g.images].map((url) => ({
        url,
        ...scoreImage(url, g.id, globalFreq),
      }));
      fb.sort((a, b) => {
        if (a.freq !== b.freq) return a.freq - b.freq;
        if (a.contains !== b.contains) return a.contains ? -1 : 1;
        return b.len - a.len;
      });
      g.bestImage = fb[0]?.url ?? [...g.images][0];
      continue;
    }

    candidates.sort((a, b) => {
      if (a.freq !== b.freq) return a.freq - b.freq;
      if (a.contains !== b.contains) return a.contains ? -1 : 1;
      return b.len - a.len;
    });

    g.bestImage = candidates[0].url;
    assigned.add(candidates[0].url);
  }

  return groups;
}

export function pickGroupImage(g?: CanonGroup): string | undefined {
  if (!g) return undefined;
  if (g.bestImage) return g.bestImage;
  if (g.images.size >= 1) return [...g.images][0];
  const withImg = g.variants.find((v) => v.image);
  return withImg?.image ?? undefined;
}
