import { supabase } from "@/lib/supabase";

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data.user;
}

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } }
  });
  if (error) throw new Error(error.message);
  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export function getUserDisplayName(user: { email?: string; user_metadata?: { full_name?: string } } | null) {
  if (!user) return "";
  return user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario";
}
