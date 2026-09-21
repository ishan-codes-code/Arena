"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getAuthenticatedEmail, signOut, updatePassword } from "@/modules/auth/lib/auth-client";
import { RecoveryOtp } from "@/modules/auth/ui/components/recovery-otp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordField } from "@/modules/auth/ui/components/auth-fields";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Use at least 8 characters."),
  confirmPassword: z.string().min(8, "Confirm your password."),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

type ResetPasswordViewProps = {
  email: string | null;
};

export function ResetPasswordView({ email }: ResetPasswordViewProps) {
  const router = useRouter();
  const [isRecoveryVerified, setIsRecoveryVerified] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const form = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    let cancelled = false;

    async function checkRecoverySession() {
      if (!email) {
        setIsCheckingSession(false);
        return;
      }

      const authenticatedEmail = await getAuthenticatedEmail();

      if (!cancelled && authenticatedEmail?.toLowerCase() === email.toLowerCase()) {
        setIsRecoveryVerified(true);
      }

      if (!cancelled) setIsCheckingSession(false);
    }

    void checkRecoverySession();

    return () => {
      cancelled = true;
    };
  }, [email]);

  async function onSubmit(values: ResetPasswordValues) {
    form.clearErrors("root.server");
    setSuccessMessage(null);

    const { error } = await updatePassword(values.password);

    if (error) {
      form.setError("root.server", { message: error.message });
      return;
    }

    setSuccessMessage("Your password has been updated. Returning to login...");
    await signOut();
    router.replace("/login");
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
            <p className="text-eyebrow text-primary">Secure reset</p>
            <CardTitle className="text-display text-4xl sm:text-6xl">Choose a new password.</CardTitle>
            <CardDescription className="max-w-md text-sm leading-relaxed text-slab-foreground/75 sm:text-base">Verify the recovery code, then secure your Arena account.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-5 sm:px-10 sm:py-10">
          {!email ? (
            <div className="grid gap-4">
              <p className="text-sm text-destructive">This recovery request is missing an email address.</p>
              <Link href="/forgot-password" className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Start again</Link>
            </div>
          ) : isCheckingSession ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" /> Checking recovery session...</p>
          ) : !isRecoveryVerified ? (
            <RecoveryOtp email={email} onVerified={() => setIsRecoveryVerified(true)} />
          ) : successMessage ? (
            <p className="text-sm text-primary">{successMessage}</p>
          ) : (
            <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <PasswordField
                id="reset-password"
                registration={form.register("password")}
                error={form.formState.errors.password?.message}
                hint="8+ characters"
                visible={passwordVisible}
                onToggle={() => setPasswordVisible((current) => !current)}
              />
              <PasswordField
                id="reset-password-confirm"
                registration={form.register("confirmPassword")}
                error={form.formState.errors.confirmPassword?.message}
                placeholder="Re-enter your password"
                visible={confirmPasswordVisible}
                onToggle={() => setConfirmPasswordVisible((current) => !current)}
              />
              {form.formState.errors.root?.server ? <p className="text-sm text-destructive">{form.formState.errors.root.server.message}</p> : null}
              <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
                {form.formState.isSubmitting ? "Updating password..." : "Update password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}