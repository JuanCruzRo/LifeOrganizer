import "server-only";
import { MercadoPagoConfig, PreApproval, PreApprovalPlan } from "mercadopago";
import { PLAN_PRICES_ARS, type PaidPlanName } from "@/lib/pricing";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export const preApproval = new PreApproval(client);
export const preApprovalPlan = new PreApprovalPlan(client);

// Checkout happens on Mercado Pago's hosted page via init_point, so the app
// never needs the browser-side public key.
export const PLAN_PRICES = PLAN_PRICES_ARS;

export type PaidPlan = PaidPlanName;
