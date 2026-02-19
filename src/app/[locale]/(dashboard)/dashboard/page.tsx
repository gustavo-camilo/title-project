import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import {
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  Plus,
} from "lucide-react";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const tOrders = await getTranslations("orders");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, credit_balance")
    .eq("id", user?.id ?? "")
    .single();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, property_address, property_city, property_state, status, created_at")
    .eq("customer_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", user?.id ?? "");

  const { count: completedOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", user?.id ?? "")
    .eq("status", "completed");

  const creditBalance = profile?.credit_balance ?? 0;
  const displayName = profile?.full_name || user?.email || "User";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {t("welcome", { name: displayName })}
        </h1>
        <Link href="/orders/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            {t("newOrder")}
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/40">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("creditBalance")}
              </p>
              <p className="text-2xl font-bold">{creditBalance}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("totalOrders")}
              </p>
              <p className="text-2xl font-bold">{totalOrders ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("completedOrders")}
              </p>
              <p className="text-2xl font-bold">{completedOrders ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border/40">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("recentOrders")}</CardTitle>
          <Link href="/orders">
            <Button variant="ghost" size="sm">
              {t("overview")} →
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!orders || orders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {t("noOrders")}
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders`}
                  className="flex items-center justify-between rounded-lg border border-border/40 p-4 transition-colors hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">{order.property_address}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.property_city}, {order.property_state}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      {tOrders(`status.${order.status}`)}
                    </Badge>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
