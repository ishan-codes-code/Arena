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
import { AuthAlert } from "@/modules/auth/ui/components/auth-alert";
import { AuthShell } from "@/modules/auth/ui/components/auth-shell";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordView({ error }: { error?: string }) {
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
    <AuthShell title="Reset your password." description="Enter your email and we'll send a recovery code if an account is eligible." stepLabel="Password recovery" stepNumber="02" activeTab={undefined} error={error} showThemeToggle={false} showNavigation={false}>
      <div className="grid gap-5">
        {submittedEmail ? (
          <div className="grid gap-4">
            <p className="font-heading text-xl font-bold">Check your email</p>
            <p className="text-sm leading-relaxed text-muted-foreground">If an account is associated with that address, a recovery code has been sent to:</p>
            <p className="break-all font-body text-sm text-foreground">{submittedEmail}</p>
            <Link href={`/reset-password?email=${encodeURIComponent(submittedEmail)}`} className="inline-flex min-h-11 items-center justify-center bg-primary px-4 font-body text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground">Enter recovery code</Link>
          </div>
        ) : (
          <>
            <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <EmailField id="forgot-password-email" registration={form.register("email")} error={form.formState.errors.email?.message} />
              {form.formState.errors.root?.server ? <AuthAlert status="error">{form.formState.errors.root.server.message}</AuthAlert> : null}
              {errorMessage ? <AuthAlert status="error">{errorMessage}</AuthAlert> : null}
              <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
                {form.formState.isSubmitting ? "Sending code..." : "Send recovery code"}
              </Button>
            </form>
            <Link href="/login" className="font-body text-[10px] uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Back to login</Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}