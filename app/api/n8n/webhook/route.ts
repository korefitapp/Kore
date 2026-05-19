import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  event: z.string(),
  data: z.record(z.unknown()).default({}),
});

/**
 * KORE → n8n webhook receiver.
 * n8n envia POSTs com eventos como `streak_at_risk`, `coach_onboarded`, etc.
 * Autenticação via header X-KORE-N8N-Token.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.N8N_WEBHOOK_SECRET;
  const got = request.headers.get("x-kore-n8n-token");

  if (!expected || got !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // TODO: dispatch por event type.
  // ex.: parsed.data.event === "streak_at_risk" → enfileirar push notification.

  return NextResponse.json({ ok: true });
}
