// The USD prices live in lib/legal-config.ts and are read by the landing page
// at runtime, so this file does not import them — tests/pricing.test.ts is
// what holds the two in sync, and it fails if they drift.
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
