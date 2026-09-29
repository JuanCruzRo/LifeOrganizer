import "server-only";
import { NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  signatureDiagnostics,
  planForVariant,
  type PaidPlan,
  type WebhookPayload,
  type LsSubscriptionStatus
} from "@/lib/lemonsqueezy";
import { findUserIdByPreapprovalId, syncSubscription } from "@/lib/server-auth";
import type { SubscriptionStatus } from "@/lib/subscription-plans";

/**
 * Lemon Squeezy signs the raw body; Mercado Pago signed query parameters and a
 * timestamp instead. Reading the body first and parsing second is the whole
 * difference: `request.json()` then re-stringify gives different bytes than
 * what was signed, so a valid delivery would fail the check forever.
 */
export async function POST(request: Request) {
  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET && process.env.NODE_ENV === "production") {
    // Fail closed. Payments would be taken and never granted otherwise, and
    // there is no way for a user to notice before their plan is missing.
    console.error("LEMONSQUEEZY_WEBHOOK_SECRET is not set; rejecting webhook");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, request.headers.get("x-signature"))) {
    // Log the shape of what arrived, never the value: enough to tell "wrong
    // secret" from "the header is sha256=<hex> and we did not account for it"
    // the first time a test event comes back 401.
    const sig = request.headers.get("x-signature");
    console.warn(
      `Invalid Lemon Squeezy webhook signature (received: ${
        sig ? `${sig.slice(0, 12)}... len=${sig.length}` : "none"
      })`
    );
    // TEMPORAL: payments are broken and the delivery log in Lemon Squeezy is the
    // only place the header is visible, so the failure echoes back what arrived.
    // Remove once the real signature format is confirmed.
    return NextResponse.json(
      { error: "Invalid signature", debug: signatureDiagnostics(rawBody, sig) },
      { status: 401 }
    );
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const event = payload.meta?.event_name ?? "";
  // Everything else (order_created, license_activated, ...) is acknowledged so
  // Lemon Squeezy stops retrying, but nothing in the app depends on it.
  if (!event.startsWith("subscription_")) {
    return NextResponse.json({ received: true });
  }

  const attributes = payload.data?.attributes;
  if (!attributes) return NextResponse.json({ received: true });

  const plan = planFromAttributes(payload);
  const status = toSubscriptionStatus(attributes.status);
  if (!plan || !status) {
    return NextResponse.json({ received: true });
  }

  // Two ways to know whose subscription this is. The custom field is written
  // on the checkout URL and echoed back here; the stored id is the fallback
  // for events that arrive without it, which is how renewals behave.
  const userId =
    payload.meta?.custom_data?.user_id || (await findUserIdByPreapprovalId(payload.data.id));
  if (!userId) {
    console.error(`Cannot attribute subscription ${payload.data.id}: no user_id and no stored id`);
    return NextResponse.json({ error: "Unknown subscription owner" }, { status: 500 });
  }

  await syncSubscription({
    userId,
    plan,
    mpPreapprovalId: payload.data.id,
    // Lemon Squeezy does not put the email on the subscription payload, only a
    // customer id. Passing empty lets syncSubscription keep whatever the
    // checkout already recorded instead of blanking it on every renewal.
    payerEmail: "",
    status
  });

  return NextResponse.json({ received: true });
}

/**
 * The variant is the durable answer: it is on every event for the life of the
 * subscription. `custom_data.plan` only rides along when the checkout set it,
 * so it is the fallback rather than the source of truth.
 */
function planFromAttributes(payload: WebhookPayload): PaidPlan | null {
  const byVariant = planForVariant(payload.data?.attributes?.variant_id);
  if (byVariant) return byVariant;

  const declared = payload.meta?.custom_data?.plan;
  return declared === "plus" || declared === "pro" ? declared : null;
}

/**
 * `past_due` and `unpaid` map to "paused", which resolvePlanForStatus treats as
 * a grace period: a retrying card must not take the plan away mid-dunning.
 * Lemon Squeezy eventually sends `cancelled`, which is what actually ends it.
 */
function toSubscriptionStatus(status: LsSubscriptionStatus): SubscriptionStatus | null {
  switch (status) {
    case "on_trial":
    case "active":
      return "authorized";
    case "paused":
    case "past_due":
    case "unpaid":
      return "paused";
    case "cancelled":
    case "expired":
      return "cancelled";
    default:
      return null;
  }
}
