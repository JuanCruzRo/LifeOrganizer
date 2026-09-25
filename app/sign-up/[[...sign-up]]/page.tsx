import { SignUp } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth-layout";
import { SignUpConsent } from "@/components/legal/legal-links";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <AuthLayout mode="sign-up">
      <SignUp appearance={clerkAppearance} />
      <SignUpConsent />
    </AuthLayout>
  );
}
