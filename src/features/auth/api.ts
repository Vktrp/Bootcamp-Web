import { API_URL } from "../../lib/utils";

export type User = {
  id: string;
  email: string;
  role: "admin" | "seller" | "customer";
};

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return (await res.json()) as { token: string; user: User };
}

export async function me() {
  const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
  if (!res.ok) throw new Error("Not authenticated");
  return (await res.json()) as User;
}
