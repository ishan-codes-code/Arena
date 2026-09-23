"use client";

import { CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type AuthAlertProps = {
  status: "error" | "success" | "info";
  children: ReactNode;
};

const icons = {
  error: TriangleAlert,
  success: CheckCircle2,
  info: Info,
};

export function AuthAlert({ status, children }: AuthAlertProps) {
  const reducedMotion = useReducedMotion();
  const Icon = icons[status];

  return (
    <motion.div
      layout
      role={status === "success" ? "status" : "alert"}
      aria-live={status === "success" ? "polite" : "assertive"}
      className={cn(
        "flex min-h-11 items-start gap-3 border px-3.5 py-3 text-sm",
        status === "error" && "border-destructive/50 bg-destructive/5 text-destructive",
        status === "success" && "border-live/50 bg-live/5 text-live",
        status === "info" && "border-border bg-muted text-foreground",
      )}
      initial={reducedMotion ? false : { opacity: 0, y: -6, x: status === "error" ? -5 : 0 }}
      animate={reducedMotion ? false : { opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <Icon className="mt-px size-4 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </motion.div>
  );
}
