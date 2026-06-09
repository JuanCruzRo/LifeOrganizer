import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Auth-capable singleton (session persisted in localStorage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

// Data client that adds owner_token header for RLS scoping.
// Uses a no-op auth storage so it always runs as anon (not as the logged-in user),
// which matches the RLS policies that scope by x-client-token header.
export function getSupabaseBrowserClient(ownerToken: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { "x-client-token": ownerToken } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storage: noopStorage }
  });
}
