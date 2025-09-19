// src/lib/gender.ts
export type ScopeGender = "men" | "women" | "infant" | undefined;

export function slugToGender(slug?: string | null): ScopeGender {
  if (!slug) return undefined;
  const s = slug.toLowerCase();
  if (s.includes("homme") || s === "men") return "men";
  if (s.includes("femme") || s === "women") return "women";
  if (s.includes("enfant") || s === "infant" || s.includes("kid")) return "infant";
  return undefined;
}

// Unisex doit apparaître pour tous
export function inScopeGender(variantGender?: string | null, scope?: ScopeGender) {
  if (!scope) return true;
  const g = (variantGender ?? "").toLowerCase();
  if (g === "unisex" || g === "unisexe") return true;
  return g === scope;
}
