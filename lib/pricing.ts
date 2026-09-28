import { LEGAL } from "@/lib/legal-config";

// Prices in ARS that Mercado Pago actually charges. The site advertises
// LEGAL.prices in USD, so these two numbers must move together: changing one
// without the other is silently overcharging or undercharging. `tests/pricing`
// fails if they drift apart.
export const PLAN_PRICES_ARS = {
  plus: 9000,
  pro: 30000,
} as const;

// The exchange rate the ARS amounts above were set at. Re-price both plans when
// the rate moves far enough that the ARS figure stops being the advertised USD.
export const ARS_PER_USD = 1500;

// How far the implied rate may drift before the mismatch is treated as a bug
// rather than normal exchange-rate movement.
export const ARS_TOLERANCE = 0.25;

export type PaidPlanName = keyof typeof PLAN_PRICES_ARS;
