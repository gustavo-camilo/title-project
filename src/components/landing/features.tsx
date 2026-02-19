import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  Landmark,
  Building2,
  Receipt,
  Hammer,
  AlertTriangle,
  Scale,
  FileWarning,
} from "lucide-react";

const featureIcons = [
  { key: "mortgages", icon: Home },
  { key: "irsLiens", icon: Landmark },
  { key: "hoaLiens", icon: Building2 },
  { key: "propertyTax", icon: Receipt },
  { key: "mechanicsLiens", icon: Hammer },
  { key: "codeViolations", icon: AlertTriangle },
  { key: "judgments", icon: Scale },
  { key: "lisPendens", icon: FileWarning },
] as const;

export function Features() {
  const t = useTranslations("features");

  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureIcons.map(({ key, icon: Icon }) => (
            <Card
              key={key}
              className="border-border/40 bg-card transition-colors hover:border-primary/30"
            >
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-base font-semibold">
                  {t(`${key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`${key}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
