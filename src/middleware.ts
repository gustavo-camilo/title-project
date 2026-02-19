import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = ["/", "/pricing", "/about", "/contact", "/blog"];
const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

function getPathnameWithoutLocale(pathname: string): string {
  const localePattern = /^\/(en|pt)(\/|$)/;
  return pathname.replace(localePattern, "/");
}

export async function middleware(request: NextRequest) {
  // First, handle intl routing
  const response = intlMiddleware(request);

  // Skip auth checks if Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl === "https://placeholder.supabase.co" ||
    supabaseUrl.includes("placeholder")
  ) {
    return response;
  }

  try {
    // Refresh the Supabase session
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathWithoutLocale = getPathnameWithoutLocale(
      request.nextUrl.pathname
    );

    // Redirect authenticated users away from auth pages
    if (user && AUTH_PATHS.some((p) => pathWithoutLocale.startsWith(p))) {
      const locale =
        request.nextUrl.pathname.match(/^\/(en|pt)/)?.[1] || "en";
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard`, request.url)
      );
    }

    // Redirect unauthenticated users away from protected pages
    const isPublic =
      PUBLIC_PATHS.some((p) => pathWithoutLocale === p) ||
      AUTH_PATHS.some((p) => pathWithoutLocale.startsWith(p)) ||
      pathWithoutLocale.startsWith("/api/");

    if (!user && !isPublic) {
      const locale =
        request.nextUrl.pathname.match(/^\/(en|pt)/)?.[1] || "en";
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  } catch {
    // If Supabase auth fails, allow the request through
    // (the page-level auth checks will handle it)
  }

  return response;
}

export const config = {
  matcher: ["/", "/(en|pt)/:path*"],
};
