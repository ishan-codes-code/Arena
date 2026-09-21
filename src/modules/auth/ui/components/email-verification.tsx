"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { resendSignupCode, verifyEmailOtp } from "@/modules/auth/lib/auth-client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type EmailVerificationProps = {
  email: string;
  onVerified: () => void;
};

const RESEND_COOLDOWN_SECONDS = 30;
const OTP_LENGTH = 8;

export function EmailVerification({ email, onVerified }: EmailVerificationProps) {
  const [token, setToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown === 0) return;

    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function handleVerify(value = token) {
    if (value.length !== OTP_LENGTH || isVerifying) return;

    setIsVerifying(true);
    setErrorMessage(null);
    setMessage(null);

    const { data, error } = await verifyEmailOtp(email, value);

    if (error || !data.session || !data.user?.email_confirmed_at) {
      setToken("");
      setErrorMessage(error?.message ?? "We could not verify your email. Please try again.");
      setIsVerifying(false);
      return;
    }

    onVerified();
  }

  async function handleResend() {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage(null);
    setMessage(null);

    const { error } = await resendSignupCode(email);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setMessage("A new verification code has been sent.");
    }

    setIsResending(false);
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <p className="font-heading text-xl font-bold">Check your email</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent an 8-digit verification code to:
        </p>
        <p className="break-all font-mono text-sm text-foreground">{email}</p>
      </div>
      <div className="grid gap-2">
        <label htmlFor="email-verification-code" className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Verification code
        </label>
        <InputOTP
          id="email-verification-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={OTP_LENGTH}
          pattern="[0-9]+"
          value={token}
          onChange={(value) => setToken(value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
          onComplete={(value) => void handleVerify(value)}
          aria-invalid={Boolean(errorMessage)}
          className="w-full justify-center"
          containerClassName="w-full justify-center"
        >
          <InputOTPGroup className="w-full justify-center">
            {Array.from({ length: OTP_LENGTH }, (_, index) => (
              <InputOTPSlot key={index} index={index} className="size-10 font-mono text-lg sm:size-11" />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      <Button type="button" size="lg" disabled={token.length !== OTP_LENGTH || isVerifying} onClick={() => void handleVerify()}>
        {isVerifying ? <LoaderCircle className="animate-spin" /> : null}
        {isVerifying ? "Verifying..." : "Verify email"}
      </Button>
      <div className="grid gap-2 text-center">
        <p className="text-sm text-muted-foreground">Didn&apos;t receive the code?</p>
        <Button type="button" variant="ghost" disabled={cooldown > 0 || isResending} onClick={handleResend}>
          {isResending ? "Sending..." : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </Button>
      </div>
    </div>
  );
}