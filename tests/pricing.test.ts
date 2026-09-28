import { describe, expect, it } from "vitest";
import { LEGAL } from "@/lib/legal-config";
import { ARS_PER_USD, ARS_TOLERANCE, PLAN_PRICES_ARS } from "@/lib/pricing";

// The landing page advertises LEGAL.prices in USD while checkout charges
// PLAN_PRICES_ARS in pesos. They are two separate literals, so a price change in
// one place used to silently disagree with the other — customers would be
// charged a different amount than the site promised. These tests fail loudly
// when the implied exchange rate drifts.
describe("pricing", () => {
  const plans = Object.keys(PLAN_PRICES_ARS) as (keyof typeof PLAN_PRICES_ARS)[];

  it("declares a price for every plan advertised on the site", () => {
    for (const plan of plans) {
      expect(LEGAL.prices[plan], `LEGAL.prices.${plan} is missing`).toBeGreaterThan(0);
    }
    expect(Object.keys(LEGAL.prices).sort()).toEqual(plans.sort());
  });

  it("charges an ARS amount consistent with the advertised USD price", () => {
    for (const plan of plans) {
      const impliedRate = PLAN_PRICES_ARS[plan] / LEGAL.prices[plan];
      const drift = Math.abs(impliedRate - ARS_PER_USD) / ARS_PER_USD;
      expect(
        drift,
        `Plan "${plan}" charges ${PLAN_PRICES_ARS[plan]} ARS but advertises $${LEGAL.prices[plan]} ` +
          `(implied rate ${impliedRate.toFixed(0)} ARS/USD vs the documented ${ARS_PER_USD}). ` +
          `Re-price PLAN_PRICES_ARS in lib/pricing.ts and LEGAL.prices in lib/legal-config.ts together.`
      ).toBeLessThanOrEqual(ARS_TOLERANCE);
    }
  });

  it("keeps Pro more expensive than Plus", () => {
    expect(PLAN_PRICES_ARS.pro).toBeGreaterThan(PLAN_PRICES_ARS.plus);
    expect(LEGAL.prices.pro).toBeGreaterThan(LEGAL.prices.plus);
  });
});
