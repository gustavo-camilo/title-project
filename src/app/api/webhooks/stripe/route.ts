import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const credits = parseInt(session.metadata?.credits ?? "0", 10);
    const packageId = session.metadata?.package_id;

    if (!userId || !credits) {
      return NextResponse.json(
        { error: "Missing metadata" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check for idempotency - don't process the same event twice
    const { data: existing } = await supabase
      .from("credit_ledger")
      .select("id")
      .eq("stripe_payment_intent_id", session.payment_intent as string)
      .single();

    if (existing) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Add credits to user balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("credit_balance")
      .eq("id", userId)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({
          credit_balance: profile.credit_balance + credits,
        })
        .eq("id", userId);

      // Record ledger entry
      await supabase.from("credit_ledger").insert({
        user_id: userId,
        amount: credits,
        type: "purchase",
        stripe_payment_intent_id: session.payment_intent as string,
        description: `Purchased ${credits} credit${credits > 1 ? "s" : ""} (${packageId})`,
      });
    }
  }

  return NextResponse.json({ received: true });
}
