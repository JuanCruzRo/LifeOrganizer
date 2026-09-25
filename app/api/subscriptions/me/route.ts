import "server-only";
import { NextResponse } from "next/server";
import { requireAuth, getUserPlanRow } from "@/lib/server-auth";

export async function GET() {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await getUserPlanRow(userId);
  if (!row) {
    return NextResponse.json({ plan: "free", trialEndsAt: null });
  }

  const trialEndsAt = row.trial_ends_at ? new Date(row.trial_ends_at) : null;
  const trialExpired = trialEndsAt !== null && trialEndsAt < new Date();
  const plan = row.plan === "plus" && trialExpired ? "free" : row.plan;

  return NextResponse.json({
    plan,
    trialEndsAt: trialExpired ? null : trialEndsAt?.toISOString() ?? null,
  });
}
