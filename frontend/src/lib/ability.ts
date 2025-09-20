// src/lib/ability.ts
export type Role = "customer" | "seller" | "admin" | null | undefined;

// Liste d’actions réellement utilisées dans ton app (d’après tes captures)
// Ajoute ici toute nouvelle action si tu en crées plus tard.
export type Action =
  | "view_seller"
  | "view_admin"
  | "sellerDashboard"
  | "adminDashboard"
  | "manageStock" // /seller, /admin/stock
  | "manageUsers" // /admin
  | "manageProducts"; // /admin/products/new, etc.

export function can(role: Role, action: Action): boolean {
  if (!role) return false;

  switch (action) {
    // Accès vendeur (et admin autorisé aussi)
    case "view_seller":
    case "sellerDashboard":
    case "manageStock":
      return role === "seller" || role === "admin";

    // Accès admin uniquement
    case "view_admin":
    case "adminDashboard":
    case "manageUsers":
    case "manageProducts":
      return role === "admin";

    default:
      return false;
  }
}
