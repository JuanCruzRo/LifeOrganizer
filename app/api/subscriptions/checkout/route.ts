import "server-only";
import { NextResponse } from "next/server";
import { requireAuthWithEmail } from "@/lib/server-auth";
import { buildCheckoutUrl, type PaidPlan } from "@/lib/lemonsqueezy";

function isPaidPlan(value: unknown): value is PaidPlan {
  return value === "plus" || value === "pro";
}

/**
 * Builds a Lemon Squeezy checkout URL.
 *
 * Unlike Mercado Pago — where a preapproval had to be created through the API
 * before the user could pay, and its id recorded so the webhook could find them
 * again — Lemon Squeezy takes a plain URL. There is no server-side object to
 * create, so nothing is written before the purchase: attribution rides on
 * `checkout[custom][user_id]`, which Lemon Squeezy echoes back in
 * `meta.custom_data` on every webhook it sends for that subscription.
 *
 * The email is prefilled because we already know it from Clerk. Making someone
 * retype the address they are already signed in with is the kind of small
 * friction that costs conversions for no reason.
 */
export async function POST(request: Request) {
  let userId: string;
  let email: string;
  try {
    ({ userId, email } = await requireAuthWithEmail());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { plan?: string };
  if (!isPaidPlan(body.plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Prefer the configured site URL: the Origin header is client-supplied and
  // would let a caller send the buyer to an arbitrary host after paying.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  try {
    const checkoutUrl = buildCheckoutUrl({
      plan: body.plan,
      userId,
      siteUrl,
      email
    });
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("Lemon Squeezy checkout failed", err);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 502 });
  }
}
