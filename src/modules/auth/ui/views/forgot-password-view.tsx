"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { requestPasswordReset } from "@/modules/auth/lib/auth-client";
import { EmailField } from "@/modules/auth/ui/components/auth-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordView() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordValues) {
    form.clearErrors("root.server");
    setErrorMessage(null);

    const { error } = await requestPasswordReset(values.email);

    if (error) {
      setErrorMessage("We could not send a recovery code right now. Please try again later.");
      return;
    }

    setSubmittedEmail(values.email);
  }

  return (
    <main className="flex min-h-dvh items-start overflow-y-auto bg-background px-3 py-3 sm:min-h-screen sm:items-center sm:px-8 sm:py-4 lg:px-12">
      <Card className="mx-auto grid w-full max-w-2xl overflow-hidden rounded-2xl border-border/70 bg-card shadow-[0_24px_80px_color-mix(in_srgb,var(--foreground)_10%,transparent)] sm:rounded-3xl">
        <CardHeader className="gap-5 border-b border-border-strong/70 bg-slab px-4 py-5 text-slab-foreground sm:px-10 sm:py-10">
          <div className="text-eyebrow flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary font-heading text-sm font-black tracking-normal text-primary-foreground">A</span>
            Arena / Account recovery
          </div>
          <div className="grid gap-3">
            <p className="text-eyebrow text-primary">Password recovery</p>
            <CardTitle className="text-display text-4xl sm:text-6xl">Reset your password.</CardTitle>
            <CardDescription className="max-w-md text-sm leading-relaxed text-slab-foreground/75 sm:text-base">Enter your email and we&apos;ll send a recovery code if an account is eligible.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 px-4 py-5 sm:px-10 sm:py-10">
          {submittedEmail ? (
            <div className="grid gap-4">
              <p className="font-heading text-xl font-bold">Check your email</p>
              <p className="text-sm leading-relaxed text-muted-foreground">If an account is associated with that address, a recovery code has been sent to:</p>
              <p className="break-all font-mono text-sm text-foreground">{submittedEmail}</p>
              <Link href={`/reset-password?email=${encodeURIComponent(submittedEmail)}`} className="inline-flex min-h-11 items-center justify-center bg-primary px-4 font-mono text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground">Enter recovery code</Link>
            </div>
          ) : (
            <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <EmailField id="forgot-password-email" registration={form.register("email")} error={form.formState.errors.email?.message} />
              {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
              <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
                {form.formState.isSubmitting ? "Sending code..." : "Send recovery code"}
              </Button>
            </form>
          )}
          <Link href="/login" className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Back to login</Link>
        </CardContent>
      </Card>
    </main>
  );
}