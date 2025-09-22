// backend/src/lib/supabase.js

 import { createClient } from "@supabase/supabase-js";

 const supabase = createClient(

  process.env.SUPABASE_URL,

  process.env.SUPABASE_SERVICE_ROLE_KEY,

  { auth: { persistSession: false, autoRefreshToken: false } }

 );

 export default supabase;