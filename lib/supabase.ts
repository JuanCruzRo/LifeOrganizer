import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Auth-capable singleton (session persisted in localStorage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Data client that adds owner_token header for RLS scoping
export function getSupabaseBrowserClient(ownerToken: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { "x-client-token": ownerToken } }
  });
}
