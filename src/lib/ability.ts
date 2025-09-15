export type Role = "customer" | "seller" | "admin";

export const roleAbilities: Record<Role, string[]> = {
  customer: ["buy", "viewOrders", "viewAccount"],
  seller: ["viewSellerDashboard", "manageStock"],
  admin: ["viewAdminDashboard", "manageUsers"], // ⛔ pas "manageStock"
};

export function can(role: Role | null | undefined, action: string) {
  if (!role) return false;
  return roleAbilities[role]?.includes(action) ?? false;
}
