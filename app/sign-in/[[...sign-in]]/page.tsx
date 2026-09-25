import { SignIn } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth-layout";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <AuthLayout mode="sign-in">
      <SignIn appearance={clerkAppearance} />
    </AuthLayout>
  );
}
