"use server";

import { createClient } from "@/lib/supabase/server";

export async function initializeChecklist(orderId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Check if checklist items already exist for this order
  const { count } = await supabase
    .from("checklist_items")
    .select("*", { count: "exact", head: true })
    .eq("order_id", orderId);

  if (count && count > 0) return { success: true, alreadyExists: true };

  // Get templates
  const { data: templates } = await supabase
    .from("checklist_templates")
    .select("category, item_name, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  if (!templates || templates.length === 0) {
    return { error: "No checklist templates found" };
  }

  // Create checklist items from templates
  const items = templates.map((tmpl) => ({
    order_id: orderId,
    category: tmpl.category,
    item_name: tmpl.item_name,
    status: "pending",
    sort_order: tmpl.sort_order,
  }));

  const { error } = await supabase.from("checklist_items").insert(items);

  if (error) return { error: "Could not create checklist" };

  // Update order status to in_progress if assigned
  await supabase
    .from("orders")
    .update({ status: "in_progress", started_at: new Date().toISOString() })
    .eq("id", orderId)
    .in("status", ["assigned"]);

  return { success: true };
}

export async function updateChecklistItem(
  itemId: string,
  data: {
    status: "pending" | "found" | "clear" | "not_applicable";
    notes?: string;
    sourceUrl?: string;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const updateData: Record<string, unknown> = {
    status: data.status,
    notes: data.notes || null,
    source_url: data.sourceUrl || null,
  };

  if (data.status !== "pending") {
    updateData.completed_at = new Date().toISOString();
  } else {
    updateData.completed_at = null;
  }

  const { error } = await supabase
    .from("checklist_items")
    .update(updateData)
    .eq("id", itemId);

  if (error) return { error: "Could not update item" };

  return { success: true };
}

export async function submitForReview(orderId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Verify researcher is assigned to this order
  const { data: order } = await supabase
    .from("orders")
    .select("id, researcher_id, status")
    .eq("id", orderId)
    .eq("researcher_id", user.id)
    .single();

  if (!order) return { error: "Order not found" };
  if (order.status !== "in_progress" && order.status !== "revision_requested") {
    return { error: "Order cannot be submitted for review in current status" };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "in_review" })
    .eq("id", orderId);

  if (error) return { error: "Could not update order" };

  return { success: true };
}
