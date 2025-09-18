// src/features/auth/api.ts
import { supabase } from "../../lib/supabase";

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

/**
 * getCurrentProfile
 * - Retourne le profil depuis la table `profiles` si elle existe
 * - Sinon, retourne des infos basiques provenant de la session Auth
 */
export async function getCurrentProfile(): Promise<{
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
} | null> {
  // 1) essaie via Auth
  const { data: sessionData } = await supabase.auth.getUser();
  const user = sessionData?.user;
  if (!user) return null;

  // 2) si table profiles existe, on la lit (sinon on ignore l’erreur)
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, email")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        email: data.email ?? user.email ?? null,
        full_name: data.full_name ?? null,
        avatar_url: data.avatar_url ?? null,
      };
    }
  } catch {
    // table absente → on tombe en fallback
  }

  // 3) fallback sans table profiles
  return {
    id: user.id,
    email: user.email ?? null,
    full_name: null,
    avatar_url: null,
  };
}

/** Petit helper pratique si tu veux juste savoir si quelqu’un est connecté */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}
