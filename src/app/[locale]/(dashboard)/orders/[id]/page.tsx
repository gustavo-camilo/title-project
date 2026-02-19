import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { StatusTimeline } from "@/components/orders/status-timeline";
import { ArrowLeft, MapPin, Calendar, FileText, Download } from "lucide-react";
import { notFound } from "next/navigation";
import { CancelOrderButton } from "@/components/orders/cancel-order-button";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("orders");
  const tDetail = await getTranslations("orderDetail");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("customer_id", user?.id ?? "")
    .single();

  if (!order) {
    notFound();
  }

  const { data: statusHistory } = await supabase
    .from("order_status_history")
    .select("id, old_status, new_status, created_at, notes")
    .eq("order_id", id)
    .order("created_at", { ascending: false });

  const { data: report } = await supabase
    .from("reports")
    .select("id, risk_level, executive_summary, created_at")
    .eq("order_id", id)
    .single();

  const statusLabels: Record<string, string> = {
    submitted: t("status.submitted"),
    assigned: t("status.assigned"),
    in_progress: t("status.in_progress"),
    in_review: t("status.in_review"),
    completed: t("status.completed"),
    revision_requested: t("status.revision_requested"),
    cancelled: t("status.cancelled"),
  };

  const canCancel = order.status === "submitted";

  return (
    <div>
      <div className="flex items-center gap-4">
        <Link href="/orders">
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
        <Badge
          variant="secondary"
          className="ml-auto text-sm"
        >
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
              {order.property_zip && (
                <div>
                  <dt className="text-sm text-muted-foreground">
                    {t("zipCode")}
                  </dt>
                  <dd className="mt-1 font-medium">{order.property_zip}</dd>
                </div>
              )}
              {order.parcel_id && (
                <div>
                  <dt className="text-sm text-muted-foreground">
                    {t("parcelId")}
                  </dt>
                  <dd className="mt-1 font-medium">{order.parcel_id}</dd>
                </div>
              )}
              {order.current_owner_name && (
                <div>
                  <dt className="text-sm text-muted-foreground">
                    {t("ownerName")}
                  </dt>
                  <dd className="mt-1 font-medium">
                    {order.current_owner_name}
                  </dd>
                </div>
              )}
              {order.auction_date && (
                <div>
                  <dt className="text-sm text-muted-foreground">
                    {t("auctionDate")}
                  </dt>
                  <dd className="mt-1 font-medium">
                    {new Date(order.auction_date).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {order.auction_type && (
                <div>
                  <dt className="text-sm text-muted-foreground">
                    {t("auctionType")}
                  </dt>
                  <dd className="mt-1 font-medium">
                    {order.auction_type === "tax_deed"
                      ? t("taxDeed")
                      : order.auction_type === "foreclosure"
                        ? t("foreclosure")
                        : t("other")}
                  </dd>
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

        {/* Sidebar: Actions + Timeline */}
        <div className="space-y-6">
          {/* Report card (if completed) */}
          {report && order.status === "completed" && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-primary" />
                  {tDetail("reportReady")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.risk_level && (
                  <div className="mb-3">
                    <span className="text-sm text-muted-foreground">
                      {tDetail("riskLevel")}:{" "}
                    </span>
                    <Badge
                      variant={
                        report.risk_level === "low"
                          ? "secondary"
                          : report.risk_level === "critical"
                            ? "destructive"
                            : "default"
                      }
                    >
                      {report.risk_level.toUpperCase()}
                    </Badge>
                  </div>
                )}
                {report.executive_summary && (
                  <p className="text-sm text-muted-foreground">
                    {report.executive_summary.slice(0, 200)}
                    {report.executive_summary.length > 200 ? "..." : ""}
                  </p>
                )}
                <a href={`/api/reports/${report.id}/download`}>
                  <Button className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Download className="mr-2 h-4 w-4" />
                    {tDetail("downloadReport")}
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}

          {/* Cancel action */}
          {canCancel && (
            <CancelOrderButton orderId={order.id} />
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <Badge className="bg-primary text-primary-foreground">
                      {t(`status.${order.status}`)}
                    </Badge>
                    <p className="mt-1 text-xs">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
