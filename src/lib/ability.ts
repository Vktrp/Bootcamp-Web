export type Role = "admin" | "seller" | "customer" | "anon";
export type Action =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "checkout"
  | "manageStock"
  | "manageUsers"
  | "viewOrders";

export function can(role: Role, action: Action): boolean {
  if (role === "admin") return true;
  if (role === "seller")
    return ["read", "update", "manageStock", "viewOrders"].includes(action);
  if (role === "customer")
    return ["read", "checkout", "viewOrders"].includes(action);
  return ["read", "checkout"].includes(action); // anon
}
