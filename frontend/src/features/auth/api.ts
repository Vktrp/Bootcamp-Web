// src/features/auth/api.ts

 import { API_URL } from "../../lib/utils";

 const TOKEN_KEY = "auth:token";

 export type SessionUser = {

  id: string;

  email: string;

  role: "customer" | "seller" | "admin" | null;

  first_name?: string | null;

  last_name?: string | null;

  address?: string | null;

 };

 export type LoginResponse = { token: string };

 export type RegisterPayload = {

  email: string;

  password: string;

  first_name?: string;

  last_name?: string;

 };

 /* ───────── Token helpers ───────── */

 export function saveToken(token: string) {

  localStorage.setItem(TOKEN_KEY, token);

 }

 export function getToken(): string | null {

  return localStorage.getItem(TOKEN_KEY);

 }

 export function clearToken() {

  localStorage.removeItem(TOKEN_KEY);

 }

 /* ───────── HTTP helper ───────── */

 async function http<T>(

  path: string,

  opts: RequestInit = {},

  useAuth = false

 ): Promise<T> {

  const headers: Record<string, string> = {

    "Content-Type": "application/json",

    ...(opts.headers as Record<string, string>),

  };

  if (useAuth) {

    const tk = getToken();

    if (tk) headers.Authorization = `Bearer ${tk}`;

  }

  const res = await fetch(`${API_URL}${path}`, {

    method: "GET",

    ...opts,

    headers,

  });

  if (res.status === 204) return undefined as unknown as T;

  let data: any = null;

  try {

    data = await res.json();

  } catch {}

  if (!res.ok) {

    const msg =

      data?.message ||

      data?.error ||

      `${res.status} ${res.statusText}` ||

      "Erreur réseau";

    throw new Error(msg);

  }

  return data as T;

 }

 /* ───────── API auth ───────── */

 export async function signIn(email: string, password: string): Promise<void> {

  const data = await http<LoginResponse>("/auth/login", {

    method: "POST",

    body: JSON.stringify({ email, password }),

  });

  saveToken(data.token);

 }

 export async function signUp(payload: RegisterPayload): Promise<void> {

  await http("/auth/register", {

    method: "POST",

    body: JSON.stringify(payload),

  });

  await signIn(payload.email, payload.password);

 }

 export async function getMe(): Promise<SessionUser> {

  return http<SessionUser>("/auth/me", { method: "GET" }, true);

 }