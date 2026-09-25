import { AuthGate } from "@/components/auth-gate";
import { StatsPage } from "@/components/stats-page";

export default function Stats() {
  return (
    <AuthGate>
      <StatsPage />
    </AuthGate>
  );
}
