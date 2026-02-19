import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Search } from "lucide-react";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Search className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">
                {t("common.appName")}
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold">{t("footer.product")}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("features.title")}
                </a>
              </li>
              <li>
                <a href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("common.pricing")}
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("howItWorks.title")}
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold">{t("footer.company")}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="/#faq" className="text-sm text-muted-foreground hover:text-foreground">
                  FAQ
                </a>
              </li>
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("common.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold">{t("footer.legal")}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("footer.disclaimer")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-8">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} TitleSearch Pro.{" "}
            {t("footer.allRightsReserved")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            {t("footer.disclaimerText")}
          </p>
        </div>
      </div>
    </footer>
  );
}
