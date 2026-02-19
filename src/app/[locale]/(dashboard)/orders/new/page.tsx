"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrder } from "@/actions/orders";
import { useState } from "react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

export default function NewOrderPage() {
  const t = useTranslations("orders");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createOrder(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("newOrder")}</h1>

      <Card className="mt-6 border-border/40">
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="propertyAddress">
                {t("propertyAddress")} *
              </Label>
              <Input
                id="propertyAddress"
                name="propertyAddress"
                required
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">{t("city")} *</Label>
                <Input id="city" name="city" required placeholder="Orlando" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">{t("state")} *</Label>
                <select
                  id="state"
                  name="state"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select state</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">{t("zipCode")}</Label>
                <Input id="zipCode" name="zipCode" placeholder="32801" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="county">{t("county")} *</Label>
                <Input
                  id="county"
                  name="county"
                  required
                  placeholder="Orange"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parcelId">{t("parcelId")}</Label>
                <Input
                  id="parcelId"
                  name="parcelId"
                  placeholder="12-34-56-7890"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ownerName">{t("ownerName")}</Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auctionDate">{t("auctionDate")}</Label>
                <Input id="auctionDate" name="auctionDate" type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auctionType">{t("auctionType")}</Label>
              <select
                id="auctionType"
                name="auctionType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select type</option>
                <option value="tax_deed">{t("taxDeed")}</option>
                <option value="foreclosure">{t("foreclosure")}</option>
                <option value="other">{t("other")}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("notes")}</Label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Any additional details about the property or auction..."
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "..." : t("submitOrder")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
