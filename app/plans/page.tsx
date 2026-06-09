import { AuthGate } from "@/components/auth-gate";
import { PlansPage } from "@/components/plans-page";

export default function Plans() {
  return (
    <AuthGate>
      <PlansPage />
    </AuthGate>
  );
}
