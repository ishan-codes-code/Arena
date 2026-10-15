"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GAME_STATUSES } from "@/modules/games/schemas";
import type { Game } from "@/modules/games/queries/games";

type ReadFirstInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value"
> & {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  description?: string;
  error?: string;
};

export const ReadFirstInput = React.forwardRef<
  HTMLInputElement,
  ReadFirstInputProps
>(
  (
    {
      id,
      label,
      value,
      onChange,
      description,
      error,
      required,
      className,
      type = "text",
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const fieldId = id || generatedId;
    const descriptionId = description ? `${fieldId}-desc` : undefined;
    const errorId = error ? `${fieldId}-error` : undefined;

    return (
      <div className="group flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={fieldId}
            className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors group-focus-within:text-foreground"
          >
            {label}
            {required && (
              <span aria-hidden="true" className="ml-1 text-destructive">
                *
              </span>
            )}
          </label>
          {description && (
            <span
              id={descriptionId}
              className="hidden text-[11px] text-muted-foreground/75 sm:inline"
            >
              {description}
            </span>
          )}
        </div>

        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={
              [descriptionId, errorId].filter(Boolean).join(" ") || undefined
            }
            className={cn(
              // Read-first default appearance (inactive):
              "h-10 w-full rounded-md border border-border/70 bg-muted/20 px-3 text-sm text-foreground transition-all duration-150 outline-none",
              "hover:border-foreground/30 hover:bg-muted/30 cursor-text",
              // Active appearance on focus:
              "focus-visible:border-ring focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:shadow-xs",
              error &&
                "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
              className,
            )}
            {...props}
          />
        </div>

        {error && (
          <p id={errorId} className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  },
);
ReadFirstInput.displayName = "ReadFirstInput";

type ReadFirstTextareaProps = Omit<
  React.ComponentProps<"textarea">,
  "onChange" | "value"
> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  error?: string;
};

export const ReadFirstTextarea = React.forwardRef<
  HTMLTextAreaElement,
  ReadFirstTextareaProps
>(
  (
    {
      id,
      label,
      value,
      onChange,
      description,
      error,
      required,
      className,
      rows = 3,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const fieldId = id || generatedId;
    const descriptionId = description ? `${fieldId}-desc` : undefined;
    const errorId = error ? `${fieldId}-error` : undefined;

    return (
      <div className="group flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={fieldId}
            className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors group-focus-within:text-foreground"
          >
            {label}
            {required && (
              <span aria-hidden="true" className="ml-1 text-destructive">
                *
              </span>
            )}
          </label>
          {description && (
            <span
              id={descriptionId}
              className="hidden text-[11px] text-muted-foreground/75 sm:inline"
            >
              {description}
            </span>
          )}
        </div>

        <div className="relative">
          <textarea
            ref={ref}
            id={fieldId}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={
              [descriptionId, errorId].filter(Boolean).join(" ") || undefined
            }
            className={cn(
              // Read-first default appearance (inactive):
              "w-full rounded-md border border-border/70 bg-muted/20 p-3 text-sm text-foreground transition-all duration-150 outline-none resize-y min-h-[96px]",
            "hover:border-foreground/30 hover:bg-muted/30 cursor-text",
            // Active appearance on focus:
            "focus-visible:border-ring focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:shadow-xs",
            error &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
            className,
          )}
          {...props}
        />
      </div>

      {error && (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
});
ReadFirstTextarea.displayName = "ReadFirstTextarea";

type ReadFirstSelectProps = {
  id?: string;
  label: string;
  description?: string;
  value: Game["status"];
  onChange: (value: Game["status"]) => void;
  disabled?: boolean;
};

export function ReadFirstStatusSelect({
  id,
  label,
  description,
  value,
  onChange,
  disabled,
}: ReadFirstSelectProps) {
  const generatedId = React.useId();
  const fieldId = id || generatedId;
  const descriptionId = description ? `${fieldId}-desc` : undefined;

  return (
    <div className="group flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={fieldId}
          className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors group-focus-within:text-foreground"
        >
          {label}
        </label>
        {description && (
          <span
            id={descriptionId}
            className="hidden text-[11px] text-muted-foreground/75 sm:inline"
          >
            {description}
          </span>
        )}
      </div>

      <Select
        value={value}
        onValueChange={(val) => onChange(val as Game["status"])}
        disabled={disabled}
      >
        <SelectTrigger
          id={fieldId}
          className={cn(
            "h-10 w-full rounded-md border border-border/70 bg-muted/20 px-3 text-sm transition-all duration-150 outline-none cursor-pointer justify-between",
            "hover:border-foreground/30 hover:bg-muted/30",
            "focus-visible:border-ring focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/25",
          )}
        >
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn(
                "size-2 rounded-full shrink-0",
                value === "active" && "bg-live",
                value === "coming_soon" && "bg-pending",
                value === "inactive" && "bg-structural",
                value === "archived" && "bg-ink",
              )}
            />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent align="start">
          <SelectGroup>
            {GAME_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2 rounded-full shrink-0",
                      status.value === "active" && "bg-live",
                      status.value === "coming_soon" && "bg-pending",
                      status.value === "inactive" && "bg-structural",
                      status.value === "archived" && "bg-ink",
                    )}
                  />
                  <span>{status.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
