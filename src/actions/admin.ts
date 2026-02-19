"use server";

import { createClient } from "@/lib/supabase/server";

export async function getResearchers() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "researcher")
    .order("full_name");

  return data ?? [];
}

export async function assignResearcher(orderId: string, researcherId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Unauthorized" };

  const { error } = await supabase
    .from("orders")
    .update({
      researcher_id: researcherId,
      status: "assigned",
      assigned_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) return { error: "Could not assign researcher" };

  return { success: true };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  notes?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Unauthorized" };

  const updateData: Record<string, string> = { status: newStatus };
  if (newStatus === "completed") {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId);

  if (error) return { error: "Could not update status" };

  return { success: true };
}
