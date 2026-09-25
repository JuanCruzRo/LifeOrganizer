import { SignUp } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth-layout";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <AuthLayout mode="sign-up">
      <SignUp appearance={clerkAppearance} />
    </AuthLayout>
  );
}
