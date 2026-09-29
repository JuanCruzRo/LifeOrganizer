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
    return NextResponse.json({ plan: "free", trialEndsAt: null, trialAvailable: true });
  }

  const trialEndsAt = row.trial_ends_at ? new Date(row.trial_ends_at) : null;
  const trialExpired = trialEndsAt !== null && trialEndsAt < new Date();
  const plan = row.plan === "plus" && trialExpired ? "free" : row.plan;

  // Whether a trial can still be started — mirrors the WHERE in startPlusTrial
  // exactly. Without this the page could only offer "start trial", which for a
  // user who already used theirs returns 409 and leaves no path to buy Plus at
  // all, so the plan was advertised with no checkout ever reachable.
  const trialAvailable =
    !row ||
    (row.plan === "free" && row.trial_ends_at === null && row.mp_preapproval_id === null);

  return NextResponse.json({
    plan,
    trialEndsAt: trialExpired ? null : trialEndsAt?.toISOString() ?? null,
    trialAvailable
  });
}
