"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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

export function signInWithEmail(email: string, password: string) {
  return createSupabaseBrowserClient().auth.signInWithPassword({ email, password });
}

export function signOut() {
  return createSupabaseBrowserClient().auth.signOut();
}