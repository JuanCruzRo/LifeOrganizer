import "server-only";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import type { UserPlan } from "@/lib/server-auth";

export type UsageKind = "milo_chat" | "ai_priority" | "ai_task_help" | "ai_task_steps" | "milo_companion";

// Max AI calls per user per day (UTC), by plan. Tune these as costs become clear.
export const DAILY_LIMITS: Record<UsageKind, Record<UserPlan, number>> = {
  milo_chat: { free: 15, plus: 60, pro: 200 },
  ai_priority: { free: 0, plus: 40, pro: 100 },
  ai_task_help: { free: 0, plus: 0, pro: 60 },
  ai_task_steps: { free: 5, plus: 30, pro: 100 },
  // Body doubling: ~3 check-ins per focus session, Pro only.
  milo_companion: { free: 0, plus: 0, pro: 60 }
};

// Hard cap on stored tasks for any plan (free is further limited in the tasks route).
export const MAX_TASKS_PER_USER = 1000;

/**
 * Atomically counts one use for today and reports whether the user is still within the limit.
 * Fails open on DB errors so an outage in the counter does not take the whole feature down.
 */
export async function consumeDailyUsage(
  userId: string,
  kind: UsageKind,
  plan: UserPlan
): Promise<{ allowed: boolean; limit: number }> {
  const limit = DAILY_LIMITS[kind][plan];
  if (limit <= 0) return { allowed: false, limit };

  try {
    const rows = await sql`
      INSERT INTO ai_usage (user_id, day, kind, count)
      VALUES (${userId}, CURRENT_DATE, ${kind}, 1)
      ON CONFLICT (user_id, day, kind) DO UPDATE SET count = ai_usage.count + 1
      RETURNING count
    `;
    return { allowed: (rows[0].count as number) <= limit, limit };
  } catch (error) {
    console.error("consumeDailyUsage failed", error);
    return { allowed: true, limit };
  }
}

export function dailyLimitResponse(limit: number, plan: UserPlan) {
  const upsell = plan === "pro" ? "" : " Puedes subir de plan en /plans para tener más.";
  return NextResponse.json(
    {
      error: `Llegaste al límite diario de ${limit} mensajes.${upsell} Se reinicia mañana.`,
      code: "DAILY_LIMIT_REACHED",
      limit
    },
    { status: 429 }
  );
}
