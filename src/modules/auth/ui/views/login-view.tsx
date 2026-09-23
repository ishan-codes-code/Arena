"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmailField, PasswordField } from "@/modules/auth/ui/components/auth-fields";
import { OAuthButtons } from "@/modules/auth/ui/components/oauth-buttons";
import { resendSignupCode, signInWithEmail, signOut } from "@/modules/auth/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AuthAlert } from "@/modules/auth/ui/components/auth-alert";
import { OtpPanel } from "@/modules/auth/ui/components/otp-panel";
import { AuthShell } from "@/modules/auth/ui/components/auth-shell";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginView({ error }: { error?: string }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    form.clearErrors("root.server");

    const { data, error } = await signInWithEmail(values.email, values.password);

    if (error) {
      if (error.code === "email_not_confirmed") {
        const { error: resendError } = await resendSignupCode(values.email);

        if (!resendError) {
          setVerificationEmail(values.email);
          return;
        }
      }

      form.setError("root.server", { message: error.message });
      return;
    }

    if (!data.session || !data.user) {
      form.setError("root.server", { message: "We could not start your session. Please try again." });
      return;
    }

    if (!data.user.email_confirmed_at) {
      await signOut();
      form.setError("root.server", { message: "Verify your email before signing in." });
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <AuthShell title="Sign in" description="Pick up exactly where you left the competition." stepLabel="Member access" stepNumber="01" activeTab="login" error={error} showThemeToggle={false}>
      {verificationEmail ? (
        <OtpPanel email={verificationEmail} type="signup" onVerified={() => router.replace("/")} />
      ) : (
        <div className="grid gap-5">
          <div className="mb-3 flex items-end justify-between border-b border-border pb-2 sm:mb-10 sm:pb-4">
            <p className="font-body text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Account details</p>
            <p className="font-body text-[10px] text-primary">Required *</p>
          </div>
          <form className="grid gap-3 sm:gap-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <EmailField id="login-email" registration={form.register("email")} error={form.formState.errors.email?.message} />
            <PasswordField
              id="login-password"
              registration={form.register("password")}
              error={form.formState.errors.password?.message}
              visible={passwordVisible}
              onToggle={() => setPasswordVisible((current) => !current)}
            />
            {form.formState.errors.root?.server ? <AuthAlert status="error">{form.formState.errors.root.server.message}</AuthAlert> : null}
            <div className="flex justify-end">
              <Link href="/forgot-password" className="font-body text-[10px] uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
              {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="my-3 flex items-center gap-2 sm:my-8 sm:gap-3">
            <Separator className="flex-1" />
            <span className="text-eyebrow text-muted-foreground">or continue with</span>
            <Separator className="flex-1" />
          </div>
          <OAuthButtons />
        </div>
      )}
    </AuthShell>
  );
}