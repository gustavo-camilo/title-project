"use server";

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { getLocale } from "next-intl/server";
import { CREDIT_PACKAGES } from "@/lib/constants";

export async function createCheckoutSession(packageId: string) {
  const supabase = await createClient();
  const locale = await getLocale();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const creditPackage = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!creditPackage) {
    return { error: "Invalid package" };
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `TitleSearch Pro - ${creditPackage.credits} Credit${creditPackage.credits > 1 ? "s" : ""}`,
            description: `${creditPackage.credits} title search credit${creditPackage.credits > 1 ? "s" : ""}`,
          },
          unit_amount: creditPackage.priceCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/credits?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/credits?cancelled=true`,
    metadata: {
      user_id: user.id,
      package_id: creditPackage.id,
      credits: creditPackage.credits.toString(),
    },
  });

  return { url: session.url };
}
