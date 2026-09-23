"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { AuthAlert } from "./auth-alert";

type OtpPanelProps = {
  email: string;
  type: "signup" | "recovery";
  onVerified: () => void;
};

const EMAIL_OTP_LENGTH = 8;
const RESEND_COOLDOWN_SECONDS = 30;

export function OtpPanel({ email, type, onVerified }: OtpPanelProps) {
  const [token, setToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const isSignup = type === "signup";

  async function handleVerify(value = token) {
    if (value.length !== EMAIL_OTP_LENGTH || isVerifying) return;
    setIsVerifying(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { verifyEmailOtp, verifyPasswordRecoveryOtp } = await import("@/modules/auth/lib/auth-client");
    const verifyFn = isSignup ? verifyEmailOtp : verifyPasswordRecoveryOtp;
    const { data, error } = await verifyFn(email, value);

    if (error || !data.session || !data.user?.email_confirmed_at) {
      setToken("");
      setErrorMessage(error?.message ?? (isSignup ? "We could not verify your email. Please try again." : "This recovery code is invalid or expired."));
      setIsVerifying(false);
      return;
    }

    onVerified();
  }

  async function handleResend() {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { resendSignupCode, resendPasswordRecoveryCode } = await import("@/modules/auth/lib/auth-client");
    const resendFn = isSignup ? resendSignupCode : resendPasswordRecoveryCode;
    const { error } = await resendFn(email);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setSuccessMessage("A new verification code has been sent.");
    }

    setIsResending(false);
  }

  const headerText = isSignup ? "Check your email" : "Check your email";
  const subText = isSignup
    ? "We sent an 8-digit verification code to:"
    : "We sent an 8-digit recovery code to:";
  const labelText = isSignup ? "Verification code" : "Recovery code";
  const buttonText = isSignup ? "Verify email" : "Verify recovery code";

  return (
    <motion.div
      layout
      className="grid gap-5"
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={reducedMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid gap-2">
        <p className="font-heading text-xl font-bold">{headerText}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{subText}</p>
        <p className="break-all font-mono text-sm text-foreground">{email}</p>
      </div>
      <div className="grid gap-2">
        <label htmlFor="otp-code" className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {labelText}
        </label>
        <InputOTP
          id="otp-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={EMAIL_OTP_LENGTH}
          pattern="[0-9]+"
          value={token}
          onChange={(value) => setToken(value.replace(/\D/g, "").slice(0, EMAIL_OTP_LENGTH))}
          onComplete={(value) => void handleVerify(value)}
          aria-invalid={Boolean(errorMessage)}
          className="w-full justify-center"
          containerClassName="w-full justify-center"
        >
          <InputOTPGroup className="w-full justify-center">
            {Array.from({ length: EMAIL_OTP_LENGTH }, (_, index) => (
              <InputOTPSlot key={index} index={index} className="size-10 font-mono text-lg sm:size-11" />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      {errorMessage && <AuthAlert status="error">{errorMessage}</AuthAlert>}
      {successMessage && <AuthAlert status="success">{successMessage}</AuthAlert>}
      <Button type="button" size="lg" disabled={token.length !== EMAIL_OTP_LENGTH || isVerifying} onClick={() => void handleVerify()}>
        {isVerifying ? <LoaderCircle className="animate-spin" /> : null}
        {isVerifying ? "Verifying..." : buttonText}
      </Button>
      <Button type="button" variant="ghost" disabled={cooldown > 0 || isResending} onClick={handleResend}>
          {isResending ? "Sending..." : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </Button>
    </motion.div>
  );
}