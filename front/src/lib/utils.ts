// src/lib/utils.ts
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const formatPrice = (cents: number = 0) =>
  (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
