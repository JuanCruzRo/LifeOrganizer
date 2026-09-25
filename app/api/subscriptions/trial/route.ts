import "server-only";
import { NextResponse } from "next/server";
import { requireAuth, getUserPlan, startPlusTrial } from "@/lib/server-auth";

const TRIAL_DAYS = 14;

export async function POST() {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentPlan = await getUserPlan(userId);
  if (currentPlan !== "free") {
    return NextResponse.json({ error: "Trial only available on Free plan" }, { status: 400 });
  }

  const trialEndsAt = await startPlusTrial(userId, TRIAL_DAYS);
  if (!trialEndsAt) {
    return NextResponse.json({ error: "Trial already used" }, { status: 409 });
  }
  return NextResponse.json({ trialEndsAt: trialEndsAt.toISOString() });
}
