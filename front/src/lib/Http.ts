// src/lib/http.ts
import { API_URL } from "./utils";

function getToken() {
  return localStorage.getItem("auth:token") || "";
}

export async function http<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    // essaie de lire le message d'erreur lisible
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.message || j?.error || "";
    } catch {}
    const msg = detail || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  // si pas de contenu
  if (res.status === 204) return undefined as any;
  return (await res.json()) as T;
}
