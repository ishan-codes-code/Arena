"use client";

import { Eye, EyeOff } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { SmoothInput } from "@/components/ui/skiper-ui/skiper106";
import { Label } from "@/components/ui/label";

type FieldProps = {
  id: string;
  registration: UseFormRegisterReturn;
  error?: string;
};

export function EmailField({ id, registration, error }: FieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>Email address</Label>
      <SmoothInput
        id={id}
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        aria-invalid={Boolean(error)}
        wrapperClassName="max-w-none rounded-none border border-input bg-transparent p-0 transition-colors has-[:focus-visible]:border-ring has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50 aria-invalid:border-destructive"
        className="h-12 px-4 font-mono text-sm placeholder:text-muted-foreground"
        style={{ fontSize: "0.875rem" }}
        {...registration}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

type PasswordFieldProps = FieldProps & {
  hint?: string;
  visible: boolean;
  onToggle: () => void;
};

export function PasswordField({ id, registration, error, hint, visible, onToggle }: PasswordFieldProps) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor={id}>Password</Label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      <div className="relative">
        <SmoothInput
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          wrapperClassName="max-w-none rounded-none border border-input bg-transparent p-0 transition-colors has-[:focus-visible]:border-ring has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50 aria-invalid:border-destructive"
          className="h-12 px-4 pr-10 font-mono text-sm placeholder:text-muted-foreground"
          style={{ fontSize: "0.875rem" }}
          aria-invalid={Boolean(error)}
          {...registration}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 size-8 -translate-y-1/2 rounded-none text-muted-foreground hover:text-foreground"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
