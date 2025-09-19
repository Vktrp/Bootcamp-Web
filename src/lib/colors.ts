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
  id: string; // clé normalisée (ex: "pure platinum")
  display: string; // libellé tel que rencontré (ex: "Pure Platinum")
  variants: SimpleVariant[];
  images: Set<string>; // toutes les images rencontrées pour ce groupe
  bestImage?: string; // image assignée au final
};

export function splitTokens(cw?: string | null): string[] {
  return (cw ?? "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normKey(token: string) {
  return token.trim().toLowerCase();
}

export function groupByCanon(
  variants: SimpleVariant[]
): Map<string, CanonGroup> {
  const groups = new Map<string, CanonGroup>();
  const imageFreq = new Map<string, number>(); // fréquence globale (tous groupes)
  const imageToGroups = new Map<string, Set<string>>(); // image -> set(keys de groupes)

  // 1) Construire les groupes + fréquences images
  for (const v of variants) {
    const tokens = splitTokens(v.colorway);
    if (!tokens.length) continue;

    for (const original of tokens) {
      const key = normKey(original);
      let g = groups.get(key);
      if (!g) {
        g = { id: key, display: original, variants: [], images: new Set() };
        groups.set(key, g);
      }
      g.variants.push(v);
      if (v.image) {
        const url = String(v.image);
        if (!g.images.has(url)) {
          g.images.add(url);
          imageFreq.set(url, (imageFreq.get(url) ?? 0) + 1);
          if (!imageToGroups.has(url)) imageToGroups.set(url, new Set());
          imageToGroups.get(url)!.add(key);
        }
      }
    }
  }

  // 2) Assignation d’images “uniques” d’abord
  const assigned = new Set<string>(); // images déjà prises
  for (const [url, freq] of imageFreq.entries()) {
    if (freq !== 1) continue;
    const gs = imageToGroups.get(url);
    if (!gs || gs.size !== 1) continue;
    const onlyKey = [...gs][0];
    const g = groups.get(onlyKey);
    if (g && !g.bestImage) {
      g.bestImage = url;
      assigned.add(url);
    }
  }

  // 3) Pour les groupes restants : choisir la moins partagée non encore assignée
  //    en favorisant l’URL qui contient le token de couleur
  type Candidate = {
    url: string;
    freq: number;
    contains: boolean;
    len: number;
  };
  const unassignedGroups: CanonGroup[] = [];
  for (const g of groups.values()) if (!g.bestImage) unassignedGroups.push(g);

  // Les groupes qui ont le moins de choix d’images passent d’abord
  unassignedGroups.sort((a, b) => a.images.size - b.images.size);

  for (const g of unassignedGroups) {
    const token = g.id; // normalisé
    const tokenRx = new RegExp(token.replace(/\s+/g, ".*"), "i");

    const candidates: Candidate[] = [...g.images]
      .filter((url) => !assigned.has(url))
      .map((url) => ({
        url,
        freq: imageFreq.get(url) ?? 0,
        contains: tokenRx.test(url),
        len: url.length,
      }));

    if (candidates.length === 0) {
      // tout est déjà pris : on tolère une image déjà assignée, mais on prend la "moins partagée"
      const fallback = [...g.images].map((url) => ({
        url,
        freq: imageFreq.get(url) ?? 0,
        contains: tokenRx.test(url),
        len: url.length,
      }));
      fallback.sort((a, b) => {
        if (a.freq !== b.freq) return a.freq - b.freq;
        if (a.contains !== b.contains) return a.contains ? -1 : 1;
        return b.len - a.len;
      });
      g.bestImage = fallback[0]?.url ?? [...g.images][0];
      // pas d'ajout à assigned (déjà pris)
      continue;
    }

    candidates.sort((a, b) => {
      if (a.freq !== b.freq) return a.freq - b.freq; // moins partagée d'abord
      if (a.contains !== b.contains) return a.contains ? -1 : 1; // URL “contient la couleur”
      return b.len - a.len; // plus spécifique
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
