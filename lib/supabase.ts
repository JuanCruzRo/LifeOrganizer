import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function isValidHttpUrl(value: string | undefined) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseBrowserClient(ownerToken: string): SupabaseClient | null {
  if (!isValidHttpUrl(supabaseUrl) || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl as string, supabaseAnonKey, {
    global: {
      headers: {
        "x-client-token": ownerToken
      }
    }
  });
}
