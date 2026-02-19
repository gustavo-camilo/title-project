"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { z } from "zod";

const orderSchema = z.object({
  propertyAddress: z.string().min(1, "Property address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  county: z.string().min(1, "County is required"),
  zipCode: z.string().optional(),
  parcelId: z.string().optional(),
  ownerName: z.string().optional(),
  auctionDate: z.string().optional(),
  auctionType: z.enum(["tax_deed", "foreclosure", "other"]).optional(),
  notes: z.string().optional(),
});

export async function createOrder(formData: FormData) {
  const supabase = await createClient();
  const locale = await getLocale();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = orderSchema.safeParse({
    propertyAddress: formData.get("propertyAddress"),
    city: formData.get("city"),
    state: formData.get("state"),
    county: formData.get("county"),
    zipCode: formData.get("zipCode"),
    parcelId: formData.get("parcelId"),
    ownerName: formData.get("ownerName"),
    auctionDate: formData.get("auctionDate"),
    auctionType: formData.get("auctionType") || undefined,
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  // Check credit balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("credit_balance")
    .eq("id", user.id)
    .single();

  if (!profile || profile.credit_balance < 1) {
    return { error: "Insufficient credits" };
  }

  // Deduct credit
  const { error: deductError } = await supabase
    .from("profiles")
    .update({ credit_balance: profile.credit_balance - 1 })
    .eq("id", user.id)
    .eq("credit_balance", profile.credit_balance); // optimistic locking

  if (deductError) {
    return { error: "Could not deduct credit. Please try again." };
  }

  // Create order
  const { error: orderError } = await supabase.from("orders").insert({
    customer_id: user.id,
    property_address: data.propertyAddress,
    property_city: data.city,
    property_state: data.state,
    property_county: data.county,
    property_zip: data.zipCode || null,
    parcel_id: data.parcelId || null,
    current_owner_name: data.ownerName || null,
    auction_date: data.auctionDate || null,
    auction_type: data.auctionType || null,
    customer_notes: data.notes || null,
    status: "submitted",
  });

  if (orderError) {
    // Refund credit on failure
    await supabase
      .from("profiles")
      .update({ credit_balance: profile.credit_balance })
      .eq("id", user.id);
    return { error: "Could not create order. Please try again." };
  }

  // Record ledger entry
  await supabase.from("credit_ledger").insert({
    user_id: user.id,
    amount: -1,
    type: "usage",
    description: `Title search: ${data.propertyAddress}, ${data.city}, ${data.state}`,
  });

  redirect({ href: "/orders", locale });
}
