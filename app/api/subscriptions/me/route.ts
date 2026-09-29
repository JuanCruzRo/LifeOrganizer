import "server-only";
import { NextResponse } from "next/server";
import { requireAuth, getUserPlanRow } from "@/lib/server-auth";
import { resolveTrialView, type UserPlan } from "@/lib/subscription-plans";

export async function GET() {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await getUserPlanRow(userId);
  if (!row) {
    return NextResponse.json({ plan: "free", trialEndsAt: null, trialAvailable: true, trialEnded: false });
  }

  const trialEndsAt = row.trial_ends_at ? new Date(row.trial_ends_at) : null;
  const now = new Date();
  const { plan, trialAvailable, trialEnded } = resolveTrialView(
    {
      plan: row.plan as UserPlan,
      trialEndsAt,
      mpPreapprovalId: row.mp_preapproval_id
    },
    now
  );

  return NextResponse.json({
    plan,
    trialEndsAt: trialEndsAt !== null && trialEndsAt < now ? null : trialEndsAt?.toISOString() ?? null,
    trialAvailable,
    trialEnded
  });
}
