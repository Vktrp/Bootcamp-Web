const API = import.meta.env.VITE_API_URL;

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  return res.json() as Promise<T>;
}

export type LoginBody = { email: string; password: string };
export type User = {
  id: string;
  email: string;
  role: "customer" | "seller" | "admin";
  avatarUrl?: string;
};

export async function login(body: LoginBody): Promise<User> {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // cookies de session
    body: JSON.stringify(body),
  });
  return json<User>(res);
}

export async function me(): Promise<User | null> {
  const res = await fetch(`${API}/auth/me`, {
    credentials: "include",
  });
  if (res.status === 401) return null;
  return json<User>(res);
}

export async function logout(): Promise<void> {
  await fetch(`${API}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}
