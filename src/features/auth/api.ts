import { supabase } from "../../lib/supabase";

export type Role = "customer" | "seller" | "admin";
export type Profile = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  avatar_url?: string;
  role: Role;
};

async function getOrCreateProfile(
  userId: string,
  email: string
): Promise<Profile> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (data) return data as Profile;
  const insert = { id: userId, email, role: "customer" as Role };
  const { data: created, error } = await supabase
    .from("profiles")
    .insert(insert)
    .select()
    .single();
  if (error) throw error;
  return created as Profile;
}

export async function signIn(
  email: string,
  password: string
): Promise<Profile> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  const u = data.user!;
  return getOrCreateProfile(u.id, u.email!);
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return (data as Profile) ?? getOrCreateProfile(user.id, user.email!);
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function updateProfile(patch: Partial<Profile>): Promise<Profile> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non connecté");
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}
