"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export const EMAIL_OTP_LENGTH = 8;

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
}

export function getPasswordRecoveryRedirectUrl(email: string) {
  const resetUrl = new URL("/reset-password", `${getSiteUrl().replace(/\/$/, "")}/`);
  resetUrl.searchParams.set("email", email);
  return resetUrl.toString();
}

export function signUpWithEmail(email: string, password: string) {
  return createSupabaseBrowserClient().auth.signUp({ email, password });
}

export function verifyEmailOtp(email: string, token: string) {
  return createSupabaseBrowserClient().auth.verifyOtp({
    email,
    token,
    type: "email",
  });
}

export function resendSignupCode(email: string) {
  return createSupabaseBrowserClient().auth.resend({
    type: "signup",
    email,
  });
}

export function requestPasswordReset(email: string) {
  return createSupabaseBrowserClient().auth.resetPasswordForEmail(email, {
    redirectTo: getPasswordRecoveryRedirectUrl(email),
  });
}

export function resendPasswordRecoveryCode(email: string) {
  return requestPasswordReset(email);
}

export function verifyPasswordRecoveryOtp(email: string, token: string) {
  return createSupabaseBrowserClient().auth.verifyOtp({
    email,
    token,
    type: "recovery",
  });
}

export async function getAuthenticatedEmail() {
  const { data, error } = await createSupabaseBrowserClient().auth.getClaims();

  if (error || typeof data?.claims?.email !== "string") {
    return null;
  }

  return data.claims.email;
}

export function updatePassword(password: string) {
  return createSupabaseBrowserClient().auth.updateUser({ password });
}

export function signInWithEmail(email: string, password: string) {
  return createSupabaseBrowserClient().auth.signInWithPassword({ email, password });
}

export function signOut() {
  return createSupabaseBrowserClient().auth.signOut();
}