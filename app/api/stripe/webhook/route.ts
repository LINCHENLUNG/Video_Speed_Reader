import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  // RAW body: the signature is computed over the exact bytes. Never call .json() first.
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("no signature", { status: 400 });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return new NextResponse("webhook not configured", { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("webhook signature verification failed", err instanceof Error ? err.message : err);
    return new NextResponse("invalid signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object;
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, unpaid: true });
  }

  const userId = session.metadata?.user_id;
  const productId = session.metadata?.product_id;
  const credits = Number(session.metadata?.credits);
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!userId || !productId || !credits || !paymentIntentId) {
    console.error("webhook missing required fields", { userId, productId, credits, paymentIntentId });
    return new NextResponse("missing metadata", { status: 400 });
  }

  const svc = createAdminClient();

  // 1. Ledger row first. The UNIQUE index on stripe_payment_intent_id makes retries idempotent.
  const { error: insertErr } = await svc.from("credit_transactions").insert({
    user_id: userId,
    amount: credits,
    type: "purchase",
    description: `Purchased ${credits} credits`,
    stripe_payment_intent_id: paymentIntentId,
  });
  if (insertErr) {
    if (insertErr.code === "23505") {
      // Already processed this payment_intent: success, so Stripe stops retrying.
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("ledger insert failed", insertErr);
    return new NextResponse("db insert failed", { status: 500 });
  }

  // 2. Increment the derived balance.
  const { data: profile } = await svc.from("profiles").select("credits_balance").eq("id", userId).single();
  const newBalance = Number(profile?.credits_balance ?? 0) + credits;
  const { error: updateErr } = await svc.from("profiles").update({ credits_balance: newBalance }).eq("id", userId);
  if (updateErr) {
    console.error("balance update failed", updateErr);
    return new NextResponse("balance update failed", { status: 500 });
  }

  return NextResponse.json({ received: true, credited: credits });
}
