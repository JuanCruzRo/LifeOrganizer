import "server-only";
import { NextResponse } from "next/server";
import { WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago";
import { preApproval, PaidPlan } from "@/lib/mercadopago";
import { findUserIdByPreapprovalId, syncSubscription } from "@/lib/server-auth";

const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET ?? "";

function isPaidPlan(value: string | undefined): value is PaidPlan {
  return value === "plus" || value === "pro";
}

function isSubscriptionStatus(
  value: string | undefined
): value is "authorized" | "paused" | "cancelled" {
  return value === "authorized" || value === "paused" || value === "cancelled";
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const topic = url.searchParams.get("type") ?? url.searchParams.get("topic");

  if (!MP_WEBHOOK_SECRET && process.env.NODE_ENV === "production") {
    console.error("MP_WEBHOOK_SECRET is not set; rejecting webhook");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  if (MP_WEBHOOK_SECRET) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        dataId,
        secret: MP_WEBHOOK_SECRET,
        toleranceSeconds: 300,
      });
    } catch (err) {
      if (err instanceof InvalidWebhookSignatureError) {
        console.warn("Invalid Mercado Pago webhook signature", err.reason);
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
      throw err;
    }
  }

  if (topic !== "subscription_preapproval" && topic !== "preapproval") {
    return NextResponse.json({ received: true });
  }

  if (!dataId) {
    return NextResponse.json({ error: "Missing data.id" }, { status: 400 });
  }

  try {
    const subscription = await preApproval.get({ id: dataId });
    // checkout stores `${userId}:${plan}` so the webhook can attribute the event
    // without depending on the preapproval id being recorded ahead of time.
    const [externalUserId, plan] = (subscription.external_reference ?? "").split(":");

    if (!isPaidPlan(plan) || !isSubscriptionStatus(subscription.status) || !subscription.id) {
      return NextResponse.json({ received: true });
    }

    const userId =
      externalUserId || (await findUserIdByPreapprovalId(subscription.id));
    if (!userId) {
      console.error(
        `Cannot attribute subscription ${subscription.id}: no userId in external_reference and no stored preapproval id`
      );
      return NextResponse.json({ error: "Unknown subscription owner" }, { status: 500 });
    }

    await syncSubscription({
      userId,
      plan,
      mpPreapprovalId: subscription.id,
      payerEmail: subscription.payer_email ?? "",
      status: subscription.status,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Mercado Pago webhook processing failed", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
