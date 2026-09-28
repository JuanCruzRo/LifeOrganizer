import "server-only";
import { NextResponse } from "next/server";
import { recordPendingSubscription, requireAuthWithEmail } from "@/lib/server-auth";
import { preApproval, PLAN_PRICES, PaidPlan } from "@/lib/mercadopago";

function isPaidPlan(value: unknown): value is PaidPlan {
  return value === "plus" || value === "pro";
}

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
  // would let a caller redirect users to an arbitrary host after paying.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  try {
    const subscription = await preApproval.create({
      body: {
        reason: `Spark ${body.plan === "pro" ? "Pro" : "Plus"} — suscripción mensual`,
        external_reference: `${userId}:${body.plan}`,
        payer_email: email,
        back_url: `${siteUrl}/?subscribed=${body.plan}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: PLAN_PRICES[body.plan],
          currency_id: "ARS",
        },
        status: "pending",
      },
    });

    if (!subscription.init_point || !subscription.id) {
      return NextResponse.json({ error: "No checkout URL returned" }, { status: 502 });
    }

    // Store the mapping before the user pays, so the webhook can attribute the
    // subscription even if Mercado Pago drops the external_reference.
    await recordPendingSubscription({
      userId,
      mpPreapprovalId: subscription.id,
      payerEmail: email,
    });

    return NextResponse.json({ checkoutUrl: subscription.init_point });
  } catch (err) {
    console.error("Mercado Pago checkout failed", err);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 502 });
  }
}
