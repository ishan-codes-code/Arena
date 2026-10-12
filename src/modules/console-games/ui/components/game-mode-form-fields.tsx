"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Controller,
  type UseFormReturn,
} from "react-hook-form";

import { Switch } from "@/components/animate-ui/components/headless/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { SmoothInput } from "@/components/ui/skiper-ui/skiper106";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { slugify, type AddGameModeInput, type AddGameModeValues } from "./add-game-mode-schema";

export type GameModeForm = UseFormReturn<AddGameModeInput, undefined, AddGameModeValues>;

const controlWrapperClassName =
  "w-full min-w-0 max-w-full rounded-md border border-input bg-background p-0 transition-colors focus-within:border-ring focus-within:outline-none focus-within:ring-3 focus-within:ring-ring/40";
const controlClassName =
  "h-10 w-full min-w-0 max-w-full px-3 text-sm text-foreground placeholder:text-muted-foreground";

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

export function AnimatedFieldError({ id, message }: { id: string; message?: string }) {
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
            <span aria-hidden="true" className="text-destructive">*</span>
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

export function GameModeFormFields({ form }: { form: GameModeForm }) {
  const nameRegistration = form.register("name");
  const nameValue = form.watch("name");
  const slugValue = form.watch("slug");
  const descriptionValue = form.watch("description");

  const nameError = form.formState.errors.name?.message;
  const slugError = form.formState.errors.slug?.message;
  const descriptionError = form.formState.errors.description?.message;
  const maxPlayersError = form.formState.errors.max_players_per_match?.message;

  return (
    <FieldGroup className="w-full min-w-0 gap-4">
      {/* Mode Name with Auto-Slug preview */}
      <FieldFrame
        id="mode-name"
        label="Mode name"
        required
        error={nameError}
        control={({ describedBy }) => (
          <SmoothInput
            {...nameRegistration}
            id="mode-name"
            value={nameValue}
            required
            aria-required="true"
            aria-invalid={Boolean(nameError || slugError)}
            aria-describedby={
              [
                describedBy,
                "mode-slug",
                slugError ? "mode-slug-error" : undefined,
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
            maxLength={120}
            placeholder="e.g. Battle Royale"
            className={controlClassName}
            wrapperClassName={cn(
              controlWrapperClassName,
              (nameError || slugError) &&
                "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
            )}
            onChange={(event) => {
              const nextName = event.currentTarget.value;
              void nameRegistration.onChange(event);
              form.clearErrors("slug");
              form.setValue("slug", slugify(nextName), {
                shouldDirty: true,
                shouldValidate: form.getFieldState("slug").isTouched,
              });
            }}
          />
        )}
        afterControl={
          <div className="grid gap-1">
            <p id="mode-slug" className="font-mono text-xs text-muted-foreground">
              Slug: {slugValue || "—"}
            </p>
            <AnimatePresence initial={false}>
              {slugError && (
                <motion.div
                  key={slugError}
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  transition={{ duration: 0.14 }}
                >
                  <FieldError id="mode-slug-error">{slugError}</FieldError>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        }
      />

      {/* Mode Description */}
      <FieldFrame
        id="mode-description"
        label="Description"
        description="Brief summary of match objectives and rules."
        error={descriptionError}
        control={({ describedBy }) => (
          <Textarea
            {...form.register("description")}
            id="mode-description"
            value={descriptionValue ?? ""}
            rows={3}
            maxLength={10000}
            placeholder="Describe the mode rules, match pacing, and victory conditions..."
            aria-invalid={Boolean(descriptionError)}
            aria-describedby={describedBy}
            className={cn(
              "resize-y text-sm",
              descriptionError && "border-destructive focus-visible:ring-destructive/20",
            )}
          />
        )}
      />

      {/* Maximum Players per Match */}
      <FieldFrame
        id="mode-max-players"
        label="Maximum players per match"
        required
        description="Total lobby capacity across all teams."
        error={maxPlayersError}
        control={({ describedBy }) => (
          <Input
            {...form.register("max_players_per_match", {
              onChange: () => {
                // Trigger re-validation of team configurations when max players changes
                if (form.formState.isSubmitted || form.formState.touchedFields.team_configurations) {
                  void form.trigger("team_configurations");
                }
              },
            })}
            id="mode-max-players"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="e.g. 100"
            required
            aria-required="true"
            aria-invalid={Boolean(maxPlayersError)}
            aria-describedby={describedBy}
            className={cn(
              "h-10 text-sm",
              maxPlayersError && "border-destructive focus-visible:ring-destructive/20",
            )}
          />
        )}
      />

      {/* Active Mode Switch */}
      <Controller
        name="active"
        control={form.control}
        render={({ field }) => (
          <Field
            orientation="horizontal"
            className="items-center justify-between gap-4 rounded-md border border-border bg-card/60 p-4"
          >
            <FieldContent>
              <FieldLabel htmlFor="mode-active" className="text-sm font-medium">
                <span id="mode-active-label">Active mode</span>
              </FieldLabel>
              <FieldDescription id="mode-active-description" className="text-xs leading-5 text-muted-foreground">
                Enable this mode for tournament creation and lobby setup.
              </FieldDescription>
            </FieldContent>
            <Switch
              id="mode-active"
              ref={field.ref}
              checked={Boolean(field.value)}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-labelledby="mode-active-label"
              aria-describedby="mode-active-description"
              className="h-6 w-11"
            />
          </Field>
        )}
      />
    </FieldGroup>
  );
}
