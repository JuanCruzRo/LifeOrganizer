// Pure plan/subscription mapping. Kept free of `server-only` and database code
// so it can be unit tested and reused from anywhere.

export type PaidPlanName = "plus" | "pro";
export type UserPlan = "free" | PaidPlanName;
export type SubscriptionStatus = "authorized" | "paused" | "cancelled";

/**
 * Mercado Pago sends "cancelled" when a subscription really ends. A "paused"
 * subscription is usually a renewal being retried, so it keeps the paid plan
 * during the grace period instead of dropping access the second a payment
 * hiccups.
 */
export function resolvePlanForStatus(
  plan: PaidPlanName,
  status: SubscriptionStatus
): UserPlan {
  return status === "cancelled" ? "free" : plan;
}
