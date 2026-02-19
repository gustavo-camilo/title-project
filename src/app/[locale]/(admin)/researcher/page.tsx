import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";

export default async function ResearcherQueuePage() {
  const t = await getTranslations("admin");
  const tOrders = await getTranslations("orders");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, property_address, property_city, property_state, property_county, status, auction_type, created_at"
    )
    .eq("researcher_id", user?.id ?? "")
    .in("status", ["assigned", "in_progress", "revision_requested"])
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("researcherQueue")}</h1>

      <div className="mt-6 space-y-3">
        {!orders || orders.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="py-12 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No assigned orders in your queue.
              </p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="border-border/40">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{order.property_address}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.property_city}, {order.property_state} &middot;{" "}
                    {order.property_county} County
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {tOrders(`status.${order.status}`)}
                  </Badge>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {t("startResearch")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
