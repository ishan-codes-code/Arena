"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmailField, PasswordField } from "@/modules/auth/ui/components/auth-fields";
import { OAuthButtons } from "@/modules/auth/ui/components/oauth-buttons";
import { signUpWithEmail, signOut } from "@/modules/auth/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AuthAlert } from "@/modules/auth/ui/components/auth-alert";
import { OtpPanel } from "@/modules/auth/ui/components/otp-panel";
import { AuthShell } from "@/modules/auth/ui/components/auth-shell";

const signupSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupView({ error }: { error?: string }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupValues) {
    form.clearErrors("root.server");

    const { data, error } = await signUpWithEmail(values.email, values.password);

    if (error) {
      form.setError("root.server", { message: error.message });
      return;
    }

    if (!data.user) {
      form.setError("root.server", { message: "We could not create your account. Please try again." });
      return;
    }

    if (data.session) {
      await signOut();
    }

    setVerificationEmail(values.email);
  }

  return (
    <AuthShell title="Sign up" description="Set up your account, then get in the game." stepLabel="New contender" stepNumber="02" activeTab="signup" error={error} showThemeToggle={false}>
      {verificationEmail ? (
        <OtpPanel email={verificationEmail} type="signup" onVerified={() => router.replace("/dashboard")} />
      ) : (
        <div className="grid gap-5">
          <div className="mb-3 flex items-end justify-between border-b border-border pb-2 sm:mb-10 sm:pb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Account details</p>
            <p className="font-mono text-[10px] text-primary">Required *</p>
          </div>
          <form className="grid gap-3 sm:gap-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <EmailField id="signup-email" registration={form.register("email")} error={form.formState.errors.email?.message} />
            <PasswordField
              id="signup-password"
              registration={form.register("password")}
              error={form.formState.errors.password?.message}
              hint="8+ characters"
              visible={passwordVisible}
              onToggle={() => setPasswordVisible((current) => !current)}
            />
            {form.formState.errors.root?.server ? <AuthAlert status="error">{form.formState.errors.root.server.message}</AuthAlert> : null}
            <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
              {form.formState.isSubmitting ? "Creating account..." : "Create account"}
            </Button>
            <p className="hidden font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground sm:block">Sign up takes only an email and password.</p>
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