import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { Plus, MapPin } from "lucide-react";

export default async function OrdersPage() {
  const t = await getTranslations("orders");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, property_address, property_city, property_state, property_county, status, auction_type, created_at"
    )
    .eq("customer_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Link href="/orders/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            {t("newOrder")}
          </Button>
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {!orders || orders.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="py-12 text-center">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No orders yet. Submit your first property search!
              </p>
              <Link href="/orders/new">
                <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                  {t("newOrder")}
                </Button>
              </Link>
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
                    {order.auction_type && ` · ${t(order.auction_type as "taxDeed" | "foreclosure" | "other")}`}
                  </p>
                </div>
                <Badge variant="secondary">{t(`status.${order.status}`)}</Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
