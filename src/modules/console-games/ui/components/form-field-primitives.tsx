"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

type FieldControlIds = {
  describedBy?: string;
  errorId: string;
};

type FieldFrameProps = {
  id: string;
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  control: (ids: FieldControlIds) => ReactNode;
  afterControl?: ReactNode;
};

export function AnimatedFieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  return (
    <div className="min-h-5" aria-live="polite">
      <AnimatePresence initial={false} mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.16 }}
          >
            <FieldError id={id} className="min-w-0 max-w-full break-words">
              {message}
            </FieldError>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FieldFrame({
  id,
  label,
  required = false,
  description,
  error,
  control,
  afterControl,
}: FieldFrameProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = `${id}-error`;
  const describedBy = [descriptionId, error ? errorId : undefined]
    .filter((value): value is string => Boolean(value))
    .join(" ");

  return (
    <Field
      data-invalid={error ? "true" : undefined}
      className="w-full min-w-0 max-w-full gap-1.5"
    >
      <FieldLabel htmlFor={id}>
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
            <span className="sr-only"> required</span>
          </>
        )}
      </FieldLabel>
      {control({ describedBy: describedBy || undefined, errorId })}
      {afterControl}
      {description && (
        <FieldDescription
          id={descriptionId}
          className="min-w-0 max-w-full break-words text-xs leading-5"
        >
          {description}
        </FieldDescription>
      )}
      <AnimatedFieldError id={errorId} message={error} />
    </Field>
  );
}