import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const packages = [
  {
    key: "starter",
    credits: 1,
    price: 49,
    perCredit: 49,
    savings: 0,
    featured: false,
  },
  {
    key: "explorer",
    credits: 5,
    price: 199,
    perCredit: 39.8,
    savings: 19,
    featured: false,
  },
  {
    key: "professional",
    credits: 15,
    price: 525,
    perCredit: 35,
    savings: 29,
    featured: true,
  },
  {
    key: "enterprise",
    credits: 50,
    price: 1500,
    perCredit: 30,
    savings: 39,
    featured: false,
  },
] as const;

export function Pricing() {
  const t = useTranslations("pricing");

  return (
    <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <Card
              key={pkg.key}
              className={`relative border-border/40 ${
                pkg.featured
                  ? "border-primary ring-1 ring-primary"
                  : ""
              }`}
            >
              {pkg.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    {t("popular")}
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4 pt-6 text-center">
                <h3 className="text-lg font-semibold">
                  {t(`${pkg.key}.name`)}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(`${pkg.key}.description`)}
                </p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">${pkg.price}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {pkg.credits} {pkg.credits === 1 ? t("credit") : t("credits")}{" "}
                  &middot; ${pkg.perCredit.toFixed(2)} {t("perCredit")}
                </p>
                {pkg.savings > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    {t("savings", { percent: pkg.savings })}
                  </Badge>
                )}
                <div className="mt-6">
                  <Link href="/signup">
                    <Button
                      className={`w-full ${
                        pkg.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : ""
                      }`}
                      variant={pkg.featured ? "default" : "outline"}
                    >
                      {t("buyNow")}
                    </Button>
                  </Link>
                </div>
                <ul className="mt-6 space-y-2 text-left text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      {pkg.credits}{" "}
                      {pkg.credits === 1 ? "complete report" : "complete reports"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      24-48 hour delivery
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      All 8 search categories
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
