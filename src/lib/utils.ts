export const API_URL = import.meta.env.VITE_API_URL || "";
export function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}
