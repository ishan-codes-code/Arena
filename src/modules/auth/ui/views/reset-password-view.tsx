"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getAuthenticatedEmail, signOut, updatePassword } from "@/modules/auth/lib/auth-client";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/modules/auth/ui/components/auth-fields";
import { AuthAlert } from "@/modules/auth/ui/components/auth-alert";
import { OtpPanel } from "@/modules/auth/ui/components/otp-panel";
import { AuthShell } from "@/modules/auth/ui/components/auth-shell";

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
    <AuthShell title="Choose a new password." description="Verify the recovery code, then secure your Arena account." stepLabel="Secure reset" stepNumber="03" activeTab={undefined} error={null} showThemeToggle={false} showNavigation={false}>
      {!email ? (
        <div className="grid gap-4">
          <p className="text-sm text-destructive">This recovery request is missing an email address.</p>
          <Link href="/forgot-password" className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Start again</Link>
        </div>
      ) : isCheckingSession ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" /> Checking recovery session...</p>
      ) : !isRecoveryVerified ? (
        <OtpPanel email={email} type="recovery" onVerified={() => setIsRecoveryVerified(true)} />
      ) : successMessage ? (
        <AuthAlert status="success">{successMessage}</AuthAlert>
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
          {form.formState.errors.root?.server ? <AuthAlert status="error">{form.formState.errors.root.server.message}</AuthAlert> : null}
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
            {form.formState.isSubmitting ? "Updating password..." : "Update password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}