import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get report and verify access
  const { data: report } = await supabase
    .from("reports")
    .select("id, order_id, pdf_path")
    .eq("id", id)
    .single();

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // Check user has access (customer, researcher, or admin)
  const { data: order } = await supabase
    .from("orders")
    .select("customer_id, researcher_id")
    .eq("id", report.order_id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isCustomer = order.customer_id === user.id;
  const isResearcher = order.researcher_id === user.id;
  const isAdmin = profile?.role === "admin";

  if (!isCustomer && !isResearcher && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!report.pdf_path) {
    return NextResponse.json(
      { error: "Report PDF not yet available" },
      { status: 404 }
    );
  }

  // Generate a signed URL (expires in 60 seconds)
  const { data: signedUrl, error: signError } = await supabase.storage
    .from("reports")
    .createSignedUrl(report.pdf_path, 60);

  if (signError || !signedUrl) {
    return NextResponse.json(
      { error: "Could not generate download URL" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(signedUrl.signedUrl);
}
