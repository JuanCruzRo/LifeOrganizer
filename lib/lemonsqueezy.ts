import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaidPlanName } from "@/lib/subscription-plans";

// Lemon Squeezy is the merchant of record: it collects and files the sales tax
// itself, so the 15% withholding that Mercado Pago needs on top of its
// commission is not a line item here. The only fee is 5% + $0.50 per
// transaction, which is why scripts/modelo-economico.ts keys off a single
// percentage instead of a percentage plus a retention.

export type PaidPlan = PaidPlanName;

/**
 * Prices are deliberately absent from this file.
 *
 * Lemon Squeezy's API cannot create or edit products (POST/PATCH on
 * /v1/products and /v1/variants are 405), so the plan prices live in the
 * dashboard and the app only ever reads the resulting variant ids. A copy of
 * the price list here could only drift from the store, and the store is what
 * actually charges the card. The figures the app does display come from
 * lib/pricing.ts.
 *
 * If you need to change a price: edit the variant on the dashboard. There is
 * no deploy involved, and none should be.
 */

/**
 * Lemon Squeezy names a variant twice, and the two uses need different halves.
 *
 *   /checkout/buy/<slug>    the buyer is sent here. The numeric id returns
 *                           404, so the slug is not interchangeable with it.
 *   attributes.variant_id  the number, on every webhook for the life of the
 *                           subscription. This is what attributes a payment
 *                           to a plan.
 *
 * Both are stable, so both are configuration. Deriving one from the other
 * would mean either a checkout link that 404s after pressing "Plus", or a
 * renewal we cannot match to anyone.
 */
function variantSlug(plan: PaidPlan): string {
  const slug = plan === "pro" ? process.env.LEMONSQUEEZY_CHECKOUT_SLUG_PRO : process.env.LEMONSQUEEZY_CHECKOUT_SLUG_PLUS;
  if (!slug) {
    throw new Error(`LEMONSQUEEZY_CHECKOUT_SLUG_${plan.toUpperCase()} is not set`);
  }
  return slug;
}

/**
 * Which plan a webhook payload belongs to.
 *
 * The variant is the durable answer: it rides on every event for the life of
 * the subscription, including renewals nobody set a custom field for. The
 * caller falls back to `meta.custom_data.plan` when this returns null.
 *
 * Returns null rather than guessing when the variant is not one of ours —
 * attributing a payment to the wrong tier is worse than not attributing it.
 */
export function planForVariant(variantId: number | undefined): PaidPlan | null {
  if (!variantId) return null;
  const pro = process.env.LEMONSQUEEZY_VARIANT_PRO;
  const plus = process.env.LEMONSQUEEZY_VARIANT_PLUS;
  if (pro && variantId === Number(pro)) return "pro";
  if (plus && variantId === Number(plus)) return "plus";
  return null;
}


/**
 * Builds the hosted checkout URL.
 *
 * A redirect — the same shape the Mercado Pago flow already had — rather than
 * Lemon Squeezy's overlay. The overlay pulls `assets.lemonsqueezy.com` into the
 * page and needs an extra CSP entry for an iframe the user cannot recover from
 * if it stalls; the hosted page always works, and "not found" cannot happen on
 * our side of the navigation.
 *
 * `checkout[custom][user_id]` is echoed back inside `meta.custom_data` on every
 * webhook. It is the only trustworthy way to attribute a payment: the payer
 * email can change, Clerk can be re-created, and a subscription id we have
 * never seen before has nowhere else to point.
 */
export function buildCheckoutUrl(params: {
  plan: PaidPlan;
  userId: string;
  email: string;
  siteUrl: string;
}): string {
  const storeDomain = process.env.LEMONSQUEEZY_STORE_DOMAIN;
  if (!storeDomain) throw new Error("LEMONSQUEEZY_STORE_DOMAIN is not set");

  // The slug, never the variant id: the id here 404s. Verified against the
  // live store, not assumed from the API docs.
  const url = new URL(`https://${storeDomain}/checkout/buy/${variantSlug(params.plan)}`);
  // Lemon Squeezy echoes these back on every webhook for this subscription.
  // They are the only attribution that survives a changed email or a
  // re-created Clerk account.
  url.searchParams.set("checkout[custom][user_id]", params.userId);
  url.searchParams.set("checkout[custom][plan]", params.plan);
  if (params.email) url.searchParams.set("checkout[email]", params.email);
  url.searchParams.set("redirect_url", `${params.siteUrl}/?subscribed=${params.plan}`);
  return url.toString();
}

/**
 * Verifies the `X-Signature` header Lemon Squeezy sends with every webhook.
 *
 * The signature is an HMAC-SHA256 of the **raw request body**, hex encoded. It
 * has to run over `request.text()` before anything parses the JSON: hashing a
 * re-serialised object produces a different byte string and the comparison
 * fails on every legitimate delivery, which is indistinguishable from an
 * attacker to whoever is reading the logs.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  // Without a secret there is nothing to compare against. Rejecting is the
  // only safe answer: a missing secret must not be treated as "no check
  // needed", or a single unset variable silently disables the gate on payments.
  if (!secret || !signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature.trim().toLowerCase(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export type WebhookEvent =
  | "subscription_created"
  | "subscription_updated"
  | "subscription_cancelled"
  | "subscription_expired"
  | "subscription_paused"
  | "subscription_resumed"
  | "subscription_payment_failed"
  | "subscription_payment_success";

/** Statuses Lemon Squeezy uses on a subscription. */
export type LsSubscriptionStatus = "on_trial" | "active" | "paused" | "past_due" | "unpaid" | "cancelled" | "expired";

export type WebhookPayload = {
  meta: {
    event_name: string;
    /** Echoed back from `checkout[custom][*]` on the checkout URL. */
    custom_data?: { user_id?: string; plan?: string };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      store_id: number;
      order_id: number;
      product_id: number;
      variant_id: number;
      customer_id: number;
      status: LsSubscriptionStatus;
      renews_at: string | null;
      ends_at: string | null;
      cancelled: boolean;
    };
  };
};
