import { API_URL } from "../../lib/utils";

export async function listMyOrders() {
  const res = await fetch(`${API_URL}/api/orders/me`);
  if (!res.ok) throw new Error("Failed");
  return await res.json();
}

export async function getOrder(id: string) {
  const res = await fetch(`${API_URL}/api/orders/${id}`);
  if (!res.ok) throw new Error("Not found");
  return await res.json();
}
