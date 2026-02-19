import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function CTASection() {
  const t = useTranslations("cta");

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-12">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          {t("subtitle")}
        </p>
        <div className="mt-8">
          <Link href="/signup">
            <Button
              size="lg"
              className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("button")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
