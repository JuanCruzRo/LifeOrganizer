import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import sql from "@/lib/db";

export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function requireAuthWithEmail(): Promise<{ userId: string; email: string }> {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress
    ?? user.emailAddresses[0]?.emailAddress
    ?? "";
  return { userId: user.id, email };
}

export type UserPlan = "free" | "plus" | "pro";

export async function getUserPlan(userId: string): Promise<UserPlan> {
  try {
    const rows = await sql`
      SELECT plan, trial_ends_at FROM user_plans WHERE user_id = ${userId} LIMIT 1
    `;
    const row = rows[0];
    if (!row) return "free";

    if (row.plan === "plus" && row.trial_ends_at && new Date(row.trial_ends_at) < new Date()) {
      return "free";
    }

    return row.plan === "pro" ? "pro" : row.plan === "plus" ? "plus" : "free";
  } catch {
    return "free";
  }
}

export async function getUserPlanRow(userId: string) {
  const rows = await sql`
    SELECT plan, trial_ends_at, mp_preapproval_id, subscription_status
    FROM user_plans WHERE user_id = ${userId} LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function startPlusTrial(userId: string, trialDays: number): Promise<Date> {
  const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
  await sql`
    INSERT INTO user_plans (user_id, plan, trial_ends_at, updated_at)
    VALUES (${userId}, 'plus', ${trialEndsAt.toISOString()}, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      plan = 'plus',
      trial_ends_at = ${trialEndsAt.toISOString()},
      updated_at = NOW()
    WHERE user_plans.plan = 'free'
  `;
  return trialEndsAt;
}

export async function saveSubscription(params: {
  userId: string;
  plan: "plus" | "pro";
  mpPreapprovalId: string;
  payerEmail: string;
  status: "authorized" | "paused" | "cancelled";
}): Promise<void> {
  await sql`
    INSERT INTO user_plans (user_id, plan, mp_preapproval_id, mp_payer_email, subscription_status, trial_ends_at, updated_at)
    VALUES (${params.userId}, ${params.plan}, ${params.mpPreapprovalId}, ${params.payerEmail}, ${params.status}, NULL, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      plan = ${params.status === "authorized" ? params.plan : "free"},
      mp_preapproval_id = ${params.mpPreapprovalId},
      mp_payer_email = ${params.payerEmail},
      subscription_status = ${params.status},
      trial_ends_at = NULL,
      updated_at = NOW()
  `;
}

export async function updateSubscriptionStatusByPreapprovalId(params: {
  mpPreapprovalId: string;
  status: "authorized" | "paused" | "cancelled";
  plan: "plus" | "pro";
}): Promise<void> {
  await sql`
    UPDATE user_plans
    SET
      plan = ${params.status === "authorized" ? params.plan : "free"},
      subscription_status = ${params.status},
      updated_at = NOW()
    WHERE mp_preapproval_id = ${params.mpPreapprovalId}
  `;
}
