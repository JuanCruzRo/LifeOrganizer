import { auth } from "@clerk/nextjs/server";
import { AuthGate } from "@/components/auth-gate";
import { PlansPage } from "@/components/plans-page";

export default async function Plans() {
  await auth.protect();
  return (
    <AuthGate>
      <PlansPage />
    </AuthGate>
  );
}
