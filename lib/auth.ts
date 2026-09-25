import { useAuth } from "@clerk/nextjs";

export function getUserDisplayName(user: { firstName?: string | null; lastName?: string | null; emailAddresses?: { emailAddress: string }[] } | null) {
  if (!user) return "";
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
  if (full.trim()) return full.trim();
  return user.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "Usuario";
}

export function getAuthToken(): Promise<string> {
  // Client-side: use Clerk's useAuth hook via getToken
  // This is a placeholder — in components, use useAuth().getToken() directly
  // In server routes, use auth() from @clerk/nextjs/server
  return Promise.resolve("");
}
