"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmailField, PasswordField } from "@/modules/auth/ui/components/auth-fields";
import { AuthTabs } from "@/modules/auth/ui/components/auth-tabs";
import { EmailVerification } from "@/modules/auth/ui/components/email-verification";
import { OAuthButtons } from "@/modules/auth/ui/components/oauth-buttons";
import { signUpWithEmail, signOut } from "@/modules/auth/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

const signupSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupView() {
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
    <main className="flex min-h-dvh items-start overflow-y-auto bg-background px-3 py-3 sm:h-auto sm:min-h-screen sm:items-center sm:px-8 sm:py-4 lg:px-12">
      <Card className="grid h-auto min-h-0 w-full max-w-6xl overflow-hidden rounded-2xl border-border/70 bg-card shadow-[0_24px_80px_color-mix(in_srgb,var(--foreground)_10%,transparent)] sm:h-auto sm:min-h-0 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:rounded-3xl">
        <CardHeader className="relative min-h-0 justify-between gap-5 border-b border-border-strong/70 bg-slab px-4 py-4 text-slab-foreground sm:min-h-92 sm:gap-12 sm:px-10 sm:py-10 lg:min-h-[620px] lg:border-r lg:border-b-0 lg:px-12 lg:py-12">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary font-heading text-sm font-black tracking-normal text-primary-foreground">A</span>
            Arena / Authentication
          </div>
          <div className="relative z-10 grid gap-2 sm:gap-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">02 — New contender</p>
            <CardTitle className="max-w-md font-heading text-2xl leading-[0.88] font-black tracking-[-0.07em] sm:text-6xl lg:text-7xl">Make your mark.</CardTitle>
            <CardDescription className="hidden max-w-[17rem] text-sm leading-relaxed text-muted-foreground sm:block sm:text-base">Set up your account, then get in the game.</CardDescription>
          </div>
          <div className="grid gap-3 sm:gap-6">
            <div className="h-px w-full bg-border" />
            <AuthTabs active="signup" />
          </div>
          <span aria-hidden className="pointer-events-none absolute right-5 bottom-20 hidden font-heading text-8xl leading-none font-black tracking-[-0.12em] text-muted opacity-60 sm:block lg:right-8 lg:bottom-36">02</span>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-col justify-center px-4 py-4 sm:px-12 sm:py-12 lg:px-16">
          {verificationEmail ? (
            <EmailVerification email={verificationEmail} onVerified={() => router.replace("/")} />
          ) : (
            <>
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
                {form.formState.errors.root?.server ? <p className="text-sm text-destructive">{form.formState.errors.root.server.message}</p> : null}
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
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
