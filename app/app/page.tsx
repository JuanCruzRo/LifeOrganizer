import { auth } from "@clerk/nextjs/server";
import { AuthGate } from "@/components/auth-gate";
import { LifeOrganizerApp } from "@/components/life-organizer-app";

export default async function HomePage() {
  // Authoritative check: middleware no longer matches paths, so the page itself
  // decides. Redirects unauthenticated visitors to sign-in.
  await auth.protect();
  return (
    <AuthGate>
      <LifeOrganizerApp />
    </AuthGate>
  );
}
