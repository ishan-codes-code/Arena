"use client";

import { AnimatePresence, motion } from "motion/react";
import type { UseFormReturn } from "react-hook-form";

import { FieldError, FieldGroup } from "@/components/ui/field";
import { SmoothInput } from "@/components/ui/skiper-ui/skiper106";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { slugify } from "@/modules/console-games/lib/slugify";
import type { GameFormInput, GameFormValues } from "./game-form-schema";
import { FieldFrame } from "./form-field-primitives";

const controlWrapperClassName =
  "w-full min-w-0 max-w-full rounded-md border border-input bg-background p-0 transition-colors focus-within:border-ring focus-within:outline-none focus-within:ring-3 focus-within:ring-ring/40";
const controlClassName =
  "h-10 w-full min-w-0 max-w-full px-3 text-sm text-foreground placeholder:text-muted-foreground";

type GameForm = UseFormReturn<GameFormInput, undefined, GameFormValues>;

type TextInputFieldProps = {
  id: string;
  label: string;
  registration: ReturnType<GameForm["register"]>;
  error?: string;
  description?: string;
  required?: boolean;
  type?: "text" | "url";
  maxLength?: number;
  placeholder?: string;
  value?: string;
};

function TextInputField({
  id,
  label,
  registration,
  error,
  description,
  required,
  type = "text",
  maxLength,
  placeholder,
  value,
}: TextInputFieldProps) {
  return (
    <FieldFrame
      id={id}
      label={label}
      required={required}
      description={description}
      error={error}
      control={({ describedBy }) => (
        <SmoothInput
          {...registration}
          id={id}
          value={value}
          type={type === "url" ? "text" : type}
          inputMode={type === "url" ? "url" : undefined}
          required={required}
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          maxLength={maxLength}
          placeholder={placeholder}
          className={controlClassName}
          wrapperClassName={cn(
            controlWrapperClassName,
            error && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
          )}
        />
      )}
    />
  );
}

export function BasicInformationStep({
  form,
}: {
  form: GameForm;
}) {
  const nameRegistration = form.register("name");
  const slugValue = form.watch("slug");
  const nameValue = form.watch("name");
  const shortNameValue = form.watch("short_name");
  const developerValue = form.watch("developer");
  const publisherValue = form.watch("publisher");

  const slugError = form.formState.errors.slug?.message;
  const nameError = form.formState.errors.name?.message;

  return (
    <FieldGroup className="w-full min-w-0 gap-4">
      <FieldFrame
        id="game-name"
        label="Game name"
        required
        error={nameError}
        control={({ describedBy }) => (
          <SmoothInput
            {...nameRegistration}
            id="game-name"
            value={nameValue}
            required
            aria-required="true"
            aria-invalid={Boolean(nameError || slugError)}
            aria-describedby={
              [
                describedBy,
                "game-slug",
                slugError ? "game-slug-error" : undefined,
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
            maxLength={120}
            placeholder="e.g. Free Fire MAX"
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
            <p id="game-slug" className="font-mono text-xs text-muted-foreground">
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
                  <FieldError id="game-slug-error">{slugError}</FieldError>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        }
      />

      <TextInputField
        id="game-short-name"
        label="Short name"
        required
        registration={form.register("short_name")}
        value={shortNameValue}
        error={form.formState.errors.short_name?.message}
        maxLength={40}
        description="A compact name used where space is limited."
        placeholder="e.g. FF MAX"
      />

      <FieldFrame
        id="game-description"
        label="Description"
        description="Optional. A concise overview shown to players."
        error={form.formState.errors.description?.message}
        control={({ describedBy }) => (
          <Textarea
            {...form.register("description")}
            id="game-description"
            value={form.watch("description")}
            aria-invalid={Boolean(form.formState.errors.description)}
            aria-describedby={describedBy}
            maxLength={10000}
            rows={3}
            placeholder="What should players know about this game?"
            className={cn(
              "min-h-24 resize-y bg-background text-sm",
              form.formState.errors.description && "border-destructive focus-visible:ring-destructive/20",
            )}
          />
        )}
      />

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <TextInputField
          id="game-developer"
          label="Developer"
          registration={form.register("developer")}
          value={developerValue}
          error={form.formState.errors.developer?.message}
          maxLength={120}
          placeholder="e.g. ZQGame Ltd."
        />
        <TextInputField
          id="game-publisher"
          label="Publisher"
          registration={form.register("publisher")}
          value={publisherValue}
          error={form.formState.errors.publisher?.message}
          maxLength={120}
          placeholder="e.g. Miniclip"
        />
      </div>
    </FieldGroup>
  );
}
