"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check } from "lucide-react";
import { createCheckoutSession } from "@/actions/credits";
import { useState } from "react";

const packages = [
  { id: "starter", credits: 1, price: 49, perCredit: 49, savings: 0, featured: false },
  { id: "explorer", credits: 5, price: 199, perCredit: 39.8, savings: 19, featured: false },
  { id: "professional", credits: 15, price: 525, perCredit: 35, savings: 29, featured: true },
  { id: "enterprise", credits: 50, price: 1500, perCredit: 30, savings: 39, featured: false },
] as const;

export default function CreditsPage() {
  const t = useTranslations("credits");
  const tPricing = useTranslations("pricing");
  const [loading, setLoading] = useState<string | null>(null);

  async function handlePurchase(packageId: string) {
    setLoading(packageId);
    const result = await createCheckoutSession(packageId);
    if (result?.url) {
      window.location.href = result.url;
    }
    setLoading(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`border-border/40 ${
              pkg.featured ? "border-primary ring-1 ring-primary" : ""
            }`}
          >
            {pkg.featured && (
              <div className="flex justify-center pt-4">
                <Badge className="bg-primary text-primary-foreground">
                  {tPricing("popular")}
                </Badge>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle>{tPricing(`${pkg.id}.name`)}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-3xl font-bold">${pkg.price}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {pkg.credits} {pkg.credits === 1 ? tPricing("credit") : tPricing("credits")}
              </p>
              {pkg.savings > 0 && (
                <Badge variant="secondary" className="mt-2">
                  {tPricing("savings", { percent: pkg.savings })}
                </Badge>
              )}
              <Button
                className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => handlePurchase(pkg.id)}
                disabled={loading === pkg.id}
              >
                {loading === pkg.id ? "..." : tPricing("buyNow")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
