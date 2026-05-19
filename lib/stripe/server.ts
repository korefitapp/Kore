import "server-only";
import Stripe from "stripe";

/**
 * Instância singleton do Stripe (server-side).
 * Stripe Connect (split payments) é configurado por request via
 *   { stripeAccount: '<conta_connect_do_lojista>' }
 * ou via { transfer_data: { destination: '...' }, application_fee_amount: ... }
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY não configurado");
  _stripe = new Stripe(key, {
    apiVersion: "2024-06-20",
    typescript: true,
  });
  return _stripe;
}

export const PLATFORM_FEE_BPS = Number(
  process.env.STRIPE_CONNECT_PLATFORM_FEE_BPS ?? "1000",
);

/** Calcula a taxa da plataforma em centavos (KORE retém X% do total). */
export function platformFeeCents(grossCents: number): number {
  return Math.round((grossCents * PLATFORM_FEE_BPS) / 10000);
}
