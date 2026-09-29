import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { verifyWebhookSignature, buildCheckoutUrl, planForVariant } from "@/lib/lemonsqueezy";

// Lemon Squeezy signs the raw body. These pin the two things that are easy to
// get wrong and impossible to notice in development: hashing the wrong bytes,
// and a missing secret being read as "signature checks are off".

const SECRET = "whsec_test_secret";
const body = JSON.stringify({
  meta: { event_name: "subscription_created", custom_data: { user_id: "user_1" } },
  data: { id: "sub_1", attributes: { status: "active", variant_id: 123 } }
});

const sign = (raw: string, secret = SECRET) =>
  createHmac("sha256", secret).update(raw, "utf8").digest("hex");

beforeEach(() => {
  process.env.LEMONSQUEEZY_WEBHOOK_SECRET = SECRET;
  process.env.LEMONSQUEEZY_VARIANT_PLUS = "111";
  process.env.LEMONSQUEEZY_VARIANT_PRO = "222";
  process.env.LEMONSQUEEZY_CHECKOUT_SLUG_PLUS = "slug-plus";
  process.env.LEMONSQUEEZY_CHECKOUT_SLUG_PRO = "slug-pro";
  process.env.LEMONSQUEEZY_STORE_DOMAIN = "spark.lemonsqueezy.com";
});

describe("verifyWebhookSignature", () => {
  it("accepts a signature over the exact raw body", () => {
    expect(verifyWebhookSignature(body, sign(body))).toBe(true);
  });

  it("rejects a body that changed after signing", () => {
    // The classic failure: `request.json()` then re-stringify. Different
    // whitespace, different bytes, different signature — and every legitimate
    // webhook would look forged.
    const altered = body.replace('"user_1"', '"user_2"');
    expect(verifyWebhookSignature(altered, sign(body))).toBe(false);
  });

  it("rejects when the secret is not configured", () => {
    delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    // Must not be read as "no secret, so nothing to check".
    expect(verifyWebhookSignature(body, sign(body))).toBe(false);
  });

  it("rejects when the header is absent", () => {
    expect(verifyWebhookSignature(body, null)).toBe(false);
    expect(verifyWebhookSignature(body, "")).toBe(false);
  });

  it("rejects a signature of a different length without throwing", () => {
    // timingSafeEqual throws on a length mismatch; the guard is what keeps a
    // malformed header from becoming a 500 instead of a 401.
    expect(verifyWebhookSignature(body, "abc")).toBe(false);
  });

  it("is case and whitespace tolerant", () => {
    expect(verifyWebhookSignature(body, `  ${sign(body).toUpperCase()}  `)).toBe(true);
  });

  it("rejects a signature made with another secret", () => {
    expect(verifyWebhookSignature(body, sign(body, "whsec_other"))).toBe(false);
  });
});

describe("buildCheckoutUrl", () => {
  it("carries the user id and plan the webhook needs to attribute payment", () => {
    const url = new URL(buildCheckoutUrl({ plan: "pro", userId: "user_9", email: "a@b.c", siteUrl: "https://sparktodo.com" }));
    expect(url.origin).toBe("https://spark.lemonsqueezy.com");
    expect(url.pathname).toBe("/checkout/buy/slug-pro");
    expect(url.searchParams.get("checkout[custom][user_id]")).toBe("user_9");
    expect(url.searchParams.get("checkout[custom][plan]")).toBe("pro");
    expect(url.searchParams.get("checkout[email]")).toBe("a@b.c");
  });

  it("addresses the variant by slug, never by id", () => {
    // Checked against the live store: /checkout/buy/<variant_id> answers 404,
    // the slug answers 302 to the real checkout. Getting this backwards costs
    // a user their payment and leaves them on a "not found" page.
    for (const plan of ["plus", "pro"] as const) {
      const url = buildCheckoutUrl({ plan, userId: "u", email: "", siteUrl: "https://s" });
      expect(url).not.toContain("/checkout/buy/111");
      expect(url).not.toContain("/checkout/buy/222");
      expect(url).toContain(plan === "plus" ? "slug-plus" : "slug-pro");
    }
  });

  it("maps each plan to its own variant", () => {
    const plus = new URL(buildCheckoutUrl({ plan: "plus", userId: "u", email: "", siteUrl: "https://s" }));
    expect(plus.pathname).toBe("/checkout/buy/slug-plus");
  });

  it("never builds a url pointing at localhost in production config", () => {
    const url = new URL(buildCheckoutUrl({ plan: "plus", userId: "u", email: "", siteUrl: "https://sparktodo.com" }));
    expect(url.searchParams.get("redirect_url")).toBe("https://sparktodo.com/?subscribed=plus");
    expect(url.searchParams.get("checkout[custom][user_id]")).toBe("u");
  });

  it("fails loudly instead of sending the user to a checkout with no variant", () => {
    delete process.env.LEMONSQUEEZY_CHECKOUT_SLUG_PLUS;
    expect(() => buildCheckoutUrl({ plan: "plus", userId: "u", email: "", siteUrl: "https://s" })).toThrow(
      /LEMONSQUEEZY_CHECKOUT_SLUG_PLUS/
    );
  });

  it("fails loudly when the store domain is missing", () => {
    delete process.env.LEMONSQUEEZY_STORE_DOMAIN;
    expect(() => buildCheckoutUrl({ plan: "plus", userId: "u", email: "", siteUrl: "https://s" })).toThrow(
      /LEMONSQUEEZY_STORE_DOMAIN/
    );
  });
});

describe("planForVariant", () => {
  it("maps each configured variant to its plan", () => {
    expect(planForVariant(111)).toBe("plus");
    expect(planForVariant(222)).toBe("pro");
  });

  it("returns null for a variant that is not one of ours", () => {
    // Guessing a tier here would hand someone a Pro they never paid for.
    expect(planForVariant(999)).toBeNull();
    expect(planForVariant(undefined)).toBeNull();
  });

  it("returns null when the variants are not configured", () => {
    delete process.env.LEMONSQUEEZY_VARIANT_PLUS;
    delete process.env.LEMONSQUEEZY_VARIANT_PRO;
    expect(planForVariant(111)).toBeNull();
  });
});
