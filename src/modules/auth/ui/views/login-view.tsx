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

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginView() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    if (values.email !== "demo@example.com" || values.password !== "password123") {
      form.setError("root.server", { message: "Those credentials do not match an account." });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-2xl shadow-black/20">
        <CardHeader className="gap-3 px-6 pt-8 sm:px-8 sm:pt-10">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary font-heading text-sm font-black text-primary-foreground">A</span>
            <span className="font-heading text-sm font-black uppercase tracking-[0.14em]">Sign in</span>
          </div>
          <div className="grid gap-1.5">
            <CardTitle className="text-3xl font-black tracking-tight">Welcome back.</CardTitle>
            <CardDescription>Sign in to continue where you left off.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 px-6 pb-8 sm:px-8 sm:pb-10">
          <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <EmailField id="login-email" registration={form.register("email")} error={form.formState.errors.email?.message} />
            <PasswordField
              id="login-password"
              registration={form.register("password")}
              error={form.formState.errors.password?.message}
              visible={passwordVisible}
              onToggle={() => setPasswordVisible((current) => !current)}
            />
            {form.formState.errors.root?.server ? <p className="text-sm text-destructive">{form.formState.errors.root.server.message}</p> : null}
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" size="lg" className="h-11" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
              {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>
          <OAuthButtons />
          <p className="text-center text-sm text-muted-foreground">New here? <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">Create an account</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}