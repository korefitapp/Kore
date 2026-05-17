import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe → KORE webhook.
 *
 * Configurar:
 *   1) stripe listen --forward-to localhost:3000/api/stripe/webhook
 *   2) STRIPE_WEBHOOK_SECRET no .env.local
 *
 * Eventos relevantes (Connect):
 *   - account.updated                  (onboarding do lojista/profissional)
 *   - checkout.session.completed       (pedido concluído)
 *   - charge.succeeded / refunded
 *   - transfer.created                 (split executado)
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!secret || !signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const stripe = getStripe();
  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid_signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "account.updated":
    case "checkout.session.completed":
    case "charge.succeeded":
    case "charge.refunded":
    case "transfer.created":
      // TODO: persistir no Supabase (orders, stripe_transactions).
      break;
    default:
      // ignorar
      break;
  }

  return NextResponse.json({ received: true });
}
