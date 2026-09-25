import "server-only";
import { NextResponse } from "next/server";
import { requireAuthWithEmail } from "@/lib/server-auth";
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

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  try {
    const subscription = await preApproval.create({
      body: {
        reason: `Spark ${body.plan === "pro" ? "Pro" : "Plus"} — suscripción mensual`,
        external_reference: `${userId}:${body.plan}`,
        payer_email: email,
        back_url: `${origin}/?subscribed=${body.plan}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: PLAN_PRICES[body.plan],
          currency_id: "ARS",
        },
        status: "pending",
      },
    });

    if (!subscription.init_point) {
      return NextResponse.json({ error: "No checkout URL returned" }, { status: 502 });
    }

    return NextResponse.json({ checkoutUrl: subscription.init_point });
  } catch (err) {
    console.error("Mercado Pago checkout failed", err);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 502 });
  }
}
