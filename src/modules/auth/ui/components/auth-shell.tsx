"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggleButton } from "@/app/modules/theme/ui/components/skiper-ui/skiper26";

type AuthShellProps = {
  title: string;
  description: ReactNode;
  stepLabel: string;
  stepNumber: string;
  activeTab?: "login" | "signup";
  error?: string | null;
  showThemeToggle?: boolean;
  showNavigation?: boolean;
  children: ReactNode;
};

export function AuthShell({
  title,
  description,
  stepLabel,
  stepNumber,
  activeTab,
  error,
  showThemeToggle = true,
  showNavigation = true,
  children,
}: AuthShellProps) {
  const reducedMotion = useReducedMotion();

  const errorCode = typeof error === "string" ? error : null;

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-0 sm:grid-cols-[1fr_1fr] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:min-h-screen">
          <motion.div
            className="relative flex flex-col justify-between gap-5 border-b border-border-strong/70 bg-slab px-4 py-4 text-slab-foreground sm:min-h-92 sm:gap-12 sm:px-10 sm:py-10 lg:min-h-full lg:border-r lg:border-b-0 lg:px-12 lg:py-12"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={reducedMotion ? false : { opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-eyebrow flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary font-heading text-sm font-black tracking-normal text-primary-foreground">A</span>
              Arena / Authentication
            </div>
            <div className="relative z-10 grid gap-2 sm:gap-5">
              <p className="text-eyebrow text-primary">{stepLabel}</p>
              <motion.h1
                className="text-display max-w-md text-2xl sm:text-6xl lg:text-7xl"
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={reducedMotion ? false : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {title}
              </motion.h1>
              <motion.p
                className="hidden max-w-[17rem] text-base leading-relaxed text-slab-foreground sm:block"
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={reducedMotion ? false : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                {description}
              </motion.p>
            </div>
            <div className="grid gap-3 sm:gap-6">
              <motion.div
                className="h-px w-full bg-border"
                initial={reducedMotion ? false : { scaleX: 0 }}
                animate={reducedMotion ? false : { scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "left" }}
              />
              {showNavigation && (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                animate={reducedMotion ? false : { opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <nav aria-label="Authentication" className="grid grid-cols-2 border border-border">
                  <Link
                    href="/login"
                    aria-current={activeTab === "login" ? "page" : undefined}
                    className={cn(
                      "px-2 py-3 text-center font-mono text-[10px] font-medium uppercase tracking-[0.12em] transition-colors sm:px-3 sm:tracking-[0.16em]",
                      activeTab === "login"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    aria-current={activeTab === "signup" ? "page" : undefined}
                    className={cn(
                      "border-l border-border px-2 py-3 text-center font-mono text-[10px] font-medium uppercase tracking-[0.12em] transition-colors sm:px-3 sm:tracking-[0.16em]",
                      activeTab === "signup"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    Sign up
                  </Link>
                </nav>
              </motion.div>
            )}
            </div>
            {showThemeToggle && (
              <motion.div
                className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6"
                initial={reducedMotion ? false : { opacity: 0, x: 10 }}
                animate={reducedMotion ? false : { opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <ThemeToggleButton variant="circle" start="top-right" className="!size-8 !rounded-md !border-none !bg-transparent !p-1 !shadow-none hover:!bg-muted" />
              </motion.div>
            )}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-5 bottom-20 hidden font-heading text-8xl leading-none font-black tracking-[-0.12em] text-muted opacity-60 sm:block lg:right-8 lg:bottom-36"
            >
              {stepNumber}
            </span>
          </motion.div>
          <motion.div
            className="flex min-h-0 flex-col justify-center px-4 py-4 sm:px-12 sm:py-12 lg:px-16"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {errorCode === "auth_callback_failed" && (
              <motion.div
                layout
                className="mb-5 flex min-h-11 items-start gap-3 border border-destructive/50 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
                role="alert"
                aria-live="assertive"
                initial={reducedMotion ? false : { opacity: 0, y: -6, x: -5 }}
                animate={reducedMotion ? false : { opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <svg className="mt-px size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" x2="12.01" y1="9" y2="9" />
                  <line x1="12" x2="12.01" y1="15" y2="15" />
                </svg>
                <p>Something went wrong with the sign-in link. Please try again.</p>
              </motion.div>
            )}
            {children}
          </motion.div>
        </div>
      </div>
      <footer className="border-t border-border bg-card px-4 py-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:flex-row">
          <span>Built for everyday players · Free entry, always.</span>
          <span>Not affiliated with or endorsed by Garena.</span>
        </div>
      </footer>
    </main>
  );
}