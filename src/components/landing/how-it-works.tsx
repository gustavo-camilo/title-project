import { useTranslations } from "next-intl";
import { ClipboardList, Search, FileCheck } from "lucide-react";

const steps = [
  { key: "step1", icon: ClipboardList, number: "01" },
  { key: "step2", icon: Search, number: "02" },
  { key: "step3", icon: FileCheck, number: "03" },
] as const;

export function HowItWorks() {
  const t = useTranslations("howItWorks");

  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map(({ key, icon: Icon, number }) => (
            <div key={key} className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <span className="mt-4 block text-xs font-bold uppercase tracking-widest text-primary">
                {number}
              </span>
              <h3 className="mt-2 text-xl font-semibold">{t(`${key}.title`)}</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {t(`${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
