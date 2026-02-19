import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { StatusTimeline } from "@/components/orders/status-timeline";
import { ArrowLeft, MapPin, User, Calendar, ClipboardList } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminOrderActions } from "@/components/orders/admin-order-actions";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("orders");
  const tAdmin = await getTranslations("admin");
  const tDetail = await getTranslations("orderDetail");
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) notFound();

  // Get customer info
  const { data: customer } = await supabase
    .from("profiles")
    .select("full_name, email, credit_balance")
    .eq("id", order.customer_id)
    .single();

  // Get researcher info if assigned
  let researcher = null;
  if (order.researcher_id) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", order.researcher_id)
      .single();
    researcher = data;
  }

  // Get all researchers for assignment
  const { data: researchers } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "researcher")
    .order("full_name");

  // Get status history
  const { data: statusHistory } = await supabase
    .from("order_status_history")
    .select("id, old_status, new_status, created_at, notes")
    .eq("order_id", id)
    .order("created_at", { ascending: false });

  // Get checklist progress
  const { data: checklistItems } = await supabase
    .from("checklist_items")
    .select("id, category, item_name, status")
    .eq("order_id", id);

  const totalItems = checklistItems?.length ?? 0;
  const completedItems =
    checklistItems?.filter((i) => i.status !== "pending").length ?? 0;

  const statusLabels: Record<string, string> = {
    submitted: t("status.submitted"),
    assigned: t("status.assigned"),
    in_progress: t("status.in_progress"),
    in_review: t("status.in_review"),
    completed: t("status.completed"),
    revision_requested: t("status.revision_requested"),
    cancelled: t("status.cancelled"),
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{tDetail("title")}</h1>
          <p className="text-sm text-muted-foreground">
            ID: {order.id.slice(0, 8)}...
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto text-sm">
          {t(`status.${order.status}`)}
        </Badge>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Property Info */}
        <Card className="border-border/40 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {tDetail("propertyInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("propertyAddress")}
                </dt>
                <dd className="mt-1 font-medium">{order.property_address}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t("city")}</dt>
                <dd className="mt-1 font-medium">{order.property_city}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t("state")}</dt>
                <dd className="mt-1 font-medium">{order.property_state}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t("county")}</dt>
                <dd className="mt-1 font-medium">{order.property_county}</dd>
              </div>
              {order.parcel_id && (
                <div>
                  <dt className="text-sm text-muted-foreground">
                    {t("parcelId")}
                  </dt>
                  <dd className="mt-1 font-medium">{order.parcel_id}</dd>
                </div>
              )}
              {order.auction_type && (
                <div>
                  <dt className="text-sm text-muted-foreground">
                    {t("auctionType")}
                  </dt>
                  <dd className="mt-1 font-medium">{order.auction_type}</dd>
                </div>
              )}
            </dl>
            {order.customer_notes && (
              <div className="mt-4 border-t border-border/40 pt-4">
                <dt className="text-sm text-muted-foreground">{t("notes")}</dt>
                <dd className="mt-1 text-sm">{order.customer_notes}</dd>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" />
                {tDetail("customerInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{customer?.full_name || "—"}</p>
              <p className="text-sm text-muted-foreground">
                {customer?.email}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {tDetail("creditsBalance")}: {customer?.credit_balance ?? 0}
              </p>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <AdminOrderActions
            orderId={order.id}
            currentStatus={order.status}
            currentResearcherId={order.researcher_id}
            researchers={researchers ?? []}
          />

          {/* Checklist Progress */}
          {totalItems > 0 && (
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  {tDetail("checklistProgress")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {completedItems}/{totalItems}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Timeline */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-primary" />
                {tDetail("statusHistory")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusHistory && statusHistory.length > 0 ? (
                <StatusTimeline
                  events={statusHistory}
                  statusLabels={statusLabels}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t(`status.${order.status}`)} —{" "}
                  {new Date(order.created_at).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
