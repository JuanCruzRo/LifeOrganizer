import "server-only";
import { MercadoPagoConfig, PreApproval, PreApprovalPlan } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export const preApproval = new PreApproval(client);
export const preApprovalPlan = new PreApprovalPlan(client);

// Precios en ARS, referenciados a USD 6 / USD 20 mensuales.
// Ajustar manualmente si la cotización se mueve significativamente.
export const PLAN_PRICES = {
  plus: 9000,
  pro: 30000,
} as const;

export type PaidPlan = keyof typeof PLAN_PRICES;
