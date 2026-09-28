import { auth } from "@clerk/nextjs/server";
import { AuthGate } from "@/components/auth-gate";
import { StatsPage } from "@/components/stats-page";

export default async function Stats() {
  await auth.protect();
  return (
    <AuthGate>
      <StatsPage />
    </AuthGate>
  );
}
