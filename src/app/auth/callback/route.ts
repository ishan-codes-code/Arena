import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const otpType = request.nextUrl.searchParams.get("type");
  const failureUrl = new URL("/login?error=auth_callback_failed", request.url);
  const requestedDestination = request.nextUrl.searchParams.get("next");
  const destination = isSafeInternalPath(requestedDestination) ? requestedDestination : "/";

  if (!code && (!tokenHash || !otpType)) {
    return NextResponse.redirect(failureUrl);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const result = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({
          token_hash: tokenHash as string,
          type: otpType as EmailOtpType,
        });

    if (result.error) {
      return NextResponse.redirect(failureUrl);
    }
  } catch {
    return NextResponse.redirect(failureUrl);
  }

  return NextResponse.redirect(new URL(destination, request.url));
}

function isSafeInternalPath(value: string | null): value is `/${string}` {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\"));
}