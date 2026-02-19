import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { ResearcherChecklist } from "@/components/orders/researcher-checklist";

export default async function ResearcherWorkspacePage({
  params,
}: {
  params: Promise<{ orderId: string; locale: string }>;
}) {
  const { orderId } = await params;
  const t = await getTranslations("orders");
  const tAdmin = await getTranslations("admin");
  const tResearcher = await getTranslations("researcher");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("researcher_id", user?.id ?? "")
    .single();

  if (!order) notFound();

  // Get checklist items
  const { data: checklistItems } = await supabase
    .from("checklist_items")
    .select("*")
    .eq("order_id", orderId)
    .order("sort_order");

  const hasChecklist = !!(checklistItems && checklistItems.length > 0);

  return (
    <div>
      <div className="flex items-center gap-4">
        <Link href="/researcher">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{tResearcher("workspace")}</h1>
          <p className="text-sm text-muted-foreground">
            ID: {order.id.slice(0, 8)}...
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto text-sm">
          {t(`status.${order.status}`)}
        </Badge>
      </div>

      {/* Property Header */}
      <Card className="mt-6 border-border/40">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">{order.property_address}</p>
              <p className="text-sm text-muted-foreground">
                {order.property_city}, {order.property_state}{" "}
                {order.property_zip} &middot; {order.property_county} County
              </p>
              {order.parcel_id && (
                <p className="text-sm text-muted-foreground">
                  {t("parcelId")}: {order.parcel_id}
                </p>
              )}
              {order.current_owner_name && (
                <p className="text-sm text-muted-foreground">
                  {t("ownerName")}: {order.current_owner_name}
                </p>
              )}
              {order.customer_notes && (
                <p className="mt-2 text-sm text-muted-foreground italic">
                  &ldquo;{order.customer_notes}&rdquo;
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <div className="mt-6">
        <ResearcherChecklist
          orderId={orderId}
          orderStatus={order.status}
          items={checklistItems ?? []}
          hasChecklist={hasChecklist}
        />
      </div>
    </div>
  );
}
