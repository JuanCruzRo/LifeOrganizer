import { AuthGate } from "@/components/auth-gate";
import { LifeOrganizerApp } from "@/components/life-organizer-app";

export default function HomePage() {
  return (
    <AuthGate>
      <LifeOrganizerApp />
    </AuthGate>
  );
}
