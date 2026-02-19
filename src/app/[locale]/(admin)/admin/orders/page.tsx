import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminOrdersPage() {
  const t = await getTranslations("admin");
  const tOrders = await getTranslations("orders");
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, property_address, property_city, property_state, property_county, status, auction_type, customer_id, researcher_id, created_at"
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("orderManagement")}</h1>

      <div className="mt-6 space-y-3">
        {!orders || orders.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No orders yet.</p>
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
                    {new Date(order.created_at).toLocaleDateString()} &middot;
                    ID: {order.id.slice(0, 8)}...
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {tOrders(`status.${order.status}`)}
                  </Badge>
                  {!order.researcher_id && order.status === "submitted" && (
                    <Badge variant="destructive">Unassigned</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
