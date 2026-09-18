"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmailField, PasswordField } from "@/modules/auth/ui/components/auth-fields";
import { AuthTabs } from "@/modules/auth/ui/components/auth-tabs";
import { OAuthButtons } from "@/modules/auth/ui/components/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const signupSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupView() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const form = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupValues) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    if (values.email === "taken@example.com") {
      form.setError("root.server", { message: "That email is already registered." });
    }
  }

  return (
    <main className="flex h-dvh min-h-0 items-start overflow-hidden bg-background sm:h-auto sm:min-h-screen sm:items-center sm:px-8 sm:py-4 lg:px-12">
      <Card className="grid h-dvh min-h-0 w-full max-w-6xl overflow-hidden rounded-none border-y border-x-0 border-border bg-card shadow-none sm:h-auto sm:min-h-0 sm:border lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <CardHeader className="relative min-h-0 justify-between gap-4 border-b border-border px-5 py-4 sm:min-h-92 sm:gap-12 sm:px-10 sm:py-10 lg:min-h-[620px] lg:border-r lg:border-b-0 lg:px-12 lg:py-12">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="flex size-7 items-center justify-center bg-primary font-heading text-sm font-black tracking-normal text-primary-foreground">A</span>
            Arena / Authentication
          </div>
          <div className="relative z-10 grid gap-2 sm:gap-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">02 — New contender</p>
            <CardTitle className="max-w-md font-heading text-3xl leading-[0.88] font-black tracking-[-0.07em] sm:text-6xl lg:text-7xl">Make your mark.</CardTitle>
            <CardDescription className="hidden max-w-[17rem] text-sm leading-relaxed text-muted-foreground sm:block sm:text-base">Set up your account, then get in the game.</CardDescription>
          </div>
          <div className="grid gap-3 sm:gap-6">
            <div className="h-px w-full bg-border" />
            <AuthTabs active="signup" />
          </div>
          <span aria-hidden className="pointer-events-none absolute right-5 bottom-20 hidden font-heading text-8xl leading-none font-black tracking-[-0.12em] text-muted opacity-60 sm:block lg:right-8 lg:bottom-36">02</span>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-col justify-center px-5 py-5 sm:px-12 sm:py-12 lg:px-16">
          <div className="mb-4 flex items-end justify-between border-b border-border pb-3 sm:mb-10 sm:pb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Account details</p>
            <p className="font-mono text-[10px] text-primary">Required *</p>
          </div>
          <form className="grid gap-4 sm:gap-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
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
            <Button type="submit" size="lg" className="h-12 rounded-none font-mono text-[11px] uppercase tracking-[0.14em]" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
              {form.formState.isSubmitting ? "Creating account..." : "Create account"}
            </Button>
            <p className="hidden font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground sm:block">Sign up takes only an email and password.</p>
          </form>
          <div className="my-4 flex items-center gap-2 sm:my-8 sm:gap-3">
            <Separator className="flex-1" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">or continue with</span>
            <Separator className="flex-1" />
          </div>
          <OAuthButtons />
        </CardContent>
      </Card>
    </main>
  );
}
