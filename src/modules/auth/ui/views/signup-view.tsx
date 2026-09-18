"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmailField, PasswordField } from "@/modules/auth/ui/components/auth-fields";
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
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-2xl shadow-black/20">
        <CardHeader className="gap-3 px-6 pt-8 sm:px-8 sm:pt-10">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary font-heading text-sm font-black text-primary-foreground">A</span>
            <span className="font-heading text-sm font-black uppercase tracking-[0.14em]">Create account</span>
          </div>
          <div className="grid gap-1.5">
            <CardTitle className="text-3xl font-black tracking-tight">Start competing.</CardTitle>
            <CardDescription>Set up your account and get in the game.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 px-6 pb-8 sm:px-8 sm:pb-10">
          <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
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
            <Button type="submit" size="lg" className="h-11" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
              {form.formState.isSubmitting ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">Sign up takes only an email and password.</p>
          </form>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>
          <OAuthButtons />
          <p className="text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}