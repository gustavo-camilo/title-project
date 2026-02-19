import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "TitleSearch Pro - Know What You're Buying Before the Auction",
    template: "%s | TitleSearch Pro",
  },
  description:
    "Comprehensive title search reports for tax deed and foreclosure auction properties. Research mortgages, liens, judgments, and encumbrances in one report.",
  keywords: [
    "title search",
    "property liens",
    "tax deed auction",
    "foreclosure auction",
    "real estate research",
    "lien search",
    "HOA liens",
    "IRS liens",
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
