import { createServerClient } from "@supabase/ssr";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Missing Supabase proxy environment variables.");
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);
  const pathname = request.nextUrl.pathname;
  const isConsolePath = pathname === "/console" || pathname.startsWith("/console/");

  if (isConsolePath) {
    const userId = data?.claims?.sub;
    if (typeof userId !== "string") {
      return redirectWithCookies(request, response, "/");
    }

    try {
      const [profile] = await db
        .select({ role: profiles.role })
        .from(profiles)
        .where(eq(profiles.user_id, userId))
        .limit(1);

      if (profile?.role !== "admin") {
        return redirectWithCookies(request, response, "/");
      }
    } catch {
      console.error("Failed to verify administrator profile.");
      return redirectWithCookies(request, response, "/");
    }
  }

  if (pathname === "/dashboard" && !isAuthenticated) {
    return redirectWithCookies(request, response, "/login");
  }

  if ((pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password") && isAuthenticated) {
    return redirectWithCookies(request, response, "/dashboard");
  }

  return response;
}

function redirectWithCookies(request: NextRequest, response: NextResponse, path: string) {
  const redirectResponse = NextResponse.redirect(new URL(path, request.url));

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export const config = {
  matcher: ["/console/:path*", "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};