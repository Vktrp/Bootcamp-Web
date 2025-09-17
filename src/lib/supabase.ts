// src/lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Checks visibles en dev
if (!url || !anon) {
  // Ce log doit apparaître si .env est mal rempli ou pas pris en compte par Vite
  console.error(
    "[supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquants. " +
      "Vérifie ton .env (préfixe VITE_) et relance `npm run dev`."
  );
}

// Singleton (évite “Multiple GoTrueClient instances” en HMR)
const g = globalThis as any;
export const supabase: SupabaseClient =
  g.__supa__ ??
  createClient(url as string, anon as string, {
    auth: { persistSession: true },
  });

if (!g.__supa__) g.__supa__ = supabase;
