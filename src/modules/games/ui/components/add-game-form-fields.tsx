"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Controller,
  type UseFormRegisterReturn,
  type UseFormReturn,
} from "react-hook-form";
import { ImageOff } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  GAME_STATUSES,
  isHttpUrl,
} from "@/modules/games/schemas";
import type { GameFormInput, GameFormValues } from "./game-form-schema";

type GameForm = UseFormReturn<GameFormInput, undefined, GameFormValues>;

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

function AnimatedFieldError({ id, message }: { id: string; message?: string }) {
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

function FieldFrame({
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

type TextInputFieldProps = {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
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

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function BasicInformationStep({
  form,
  mode,
}: {
  form: GameForm;
  mode: "create" | "edit";
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
            aria-invalid={Boolean(
              nameError || (mode === "create" && slugError),
            )}
            aria-describedby={
              [
                describedBy,
                mode === "create" ? "game-slug" : undefined,
                mode === "create" && slugError ? "game-slug-error" : undefined,
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
            maxLength={120}
            placeholder="e.g. Free Fire MAX"
            className={controlClassName}
            wrapperClassName={cn(
              controlWrapperClassName,
              (nameError || (mode === "create" && slugError)) &&
                "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
            )}
            onChange={(event) => {
              const nextName = event.currentTarget.value;
              void nameRegistration.onChange(event);
              if (mode === "create") {
                form.clearErrors("slug");
                form.setValue("slug", slugify(nextName), {
                  shouldDirty: true,
                  shouldValidate: form.getFieldState("slug").isTouched,
                });
              }
            }}
          />
        )}
        afterControl={
          mode === "create" && (
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
          )
        }
      />

      {mode === "edit" && (
        <TextInputField
          id="game-slug"
          label="Slug"
          registration={form.register("slug")}
          value={form.watch("slug")}
          error={slugError}
          required
          maxLength={100}
          placeholder="e.g. free-fire-max"
        />
      )}

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

type ArtworkKind = "icon" | "logo" | "banner";

const artworkPreviewClasses: Record<ArtworkKind, string> = {
  icon: "aspect-square w-16",
  logo: "aspect-[3/1] w-36",
  banner: "aspect-video w-full max-w-64",
};

function ArtworkPreview({
  src,
  label,
  kind,
}: {
  src: string;
  label: string;
  kind: ArtworkKind;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-md border border-border bg-muted",
        artworkPreviewClasses[kind],
      )}
      aria-busy={state === "loading"}
    >
      {state !== "failed" && (
        <Image
          src={src}
          alt={`${label} preview`}
          fill
          unoptimized
          sizes={kind === "banner" ? "256px" : kind === "logo" ? "144px" : "64px"}
          className={cn(
            "object-contain p-1 transition-opacity duration-150",
            state === "loaded" ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setState("loaded")}
          onError={() => setState("failed")}
        />
      )}
      <AnimatePresence initial={false} mode="wait">
        {state === "loading" && (
          <motion.div
            key="preview-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 grid place-items-center text-[11px] text-muted-foreground"
            aria-hidden="true"
          >
            Loading preview
          </motion.div>
        )}
        {state === "failed" && (
          <motion.div
            key="preview-failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center text-[11px] text-muted-foreground"
            role="status"
          >
            <ImageOff aria-hidden="true" className="size-4" />
            <span>Preview unavailable</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArtworkUrlField({
  form,
  name,
  label,
  description,
  kind,
}: {
  form: GameForm;
  name: "icon_url" | "logo_url" | "banner_url";
  label: string;
  description: string;
  kind: ArtworkKind;
}) {
  const value = form.watch(name);
  const error = form.formState.errors[name]?.message;
  const showPreview = isHttpUrl(value);

  return (
    <FieldFrame
      id={name}
      label={label}
      required
      description={description}
      error={error}
      control={({ describedBy }) => (
        <SmoothInput
          {...form.register(name)}
          id={name}
          value={value}
          type="text"
          inputMode="url"
          required
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          maxLength={2048}
          placeholder="https://example.com/artwork.png"
          className={controlClassName}
          wrapperClassName={cn(
            controlWrapperClassName,
            error && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
          )}
        />
      )}
      afterControl={
        <AnimatePresence initial={false}>
          {showPreview && (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.16 }}
            >
              <ArtworkPreview key={value} src={value} label={label} kind={kind} />
            </motion.div>
          )}
        </AnimatePresence>
      }
    />
  );
}

export function GameArtworkStep({
  form,
}: {
  form: GameForm;
}) {
  return (
    <FieldGroup className="w-full min-w-0 gap-5">
      <ArtworkUrlField
        form={form}
        name="icon_url"
        label="Icon URL"
        description="Square artwork used to identify the game in compact lists."
        kind="icon"
      />
      <ArtworkUrlField
        form={form}
        name="logo_url"
        label="Logo URL"
        description="A transparent or wide logo for featured placements."
        kind="logo"
      />
      <ArtworkUrlField
        form={form}
        name="banner_url"
        label="Banner URL"
        description="Wide artwork used on the game’s featured presentation."
        kind="banner"
      />
    </FieldGroup>
  );
}

export function PublishingSettingsStep({
  form,
  portalContainer,
  showSortOrder,
}: {
  form: GameForm;
  portalContainer: HTMLElement | null;
  showSortOrder: boolean;
}) {
  const statusError = form.formState.errors.status?.message;
  const sortOrderError = form.formState.errors.sort_order?.message;

  return (
    <FieldGroup className="w-full min-w-0 gap-5">
      <FieldFrame
        id="game-status"
        label="Status"
        required
        description="Choose how this game is presented across Arena."
        error={statusError}
        control={({ describedBy }) => (
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="game-status"
                  ref={field.ref}
                  onBlur={field.onBlur}
                  aria-required="true"
                  aria-invalid={Boolean(statusError)}
                  aria-describedby={describedBy}
                  className={cn(
                    "h-11 w-full bg-background",
                    statusError && "border-destructive focus-visible:ring-destructive/20",
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start" container={portalContainer}>
                  <SelectGroup>
                    {GAME_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        )}
      />

      <Controller
        name="is_featured"
        control={form.control}
        render={({ field }) => (
          <Field
            orientation="horizontal"
            className="items-center justify-between gap-4 rounded-md border border-border bg-background p-4"
          >
            <FieldContent>
              <FieldLabel htmlFor="game-featured" className="text-sm">
                <span id="game-featured-label">Featured game</span>
              </FieldLabel>
              <FieldDescription id="game-featured-description" className="text-xs leading-5">
                Give this game a prominent position in Arena.
              </FieldDescription>
            </FieldContent>
            <Switch
              id="game-featured"
              ref={field.ref}
              checked={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-labelledby="game-featured-label"
              aria-describedby="game-featured-description"
              className="h-6 w-11"
            />
          </Field>
        )}
      />

      {showSortOrder && (
        <FieldFrame
          id="game-sort-order"
          label="Sort order"
          description="Lower numbers appear first in Arena."
          error={sortOrderError}
          control={({ describedBy }) => (
            <Input
              {...form.register("sort_order", { valueAsNumber: true })}
              id="game-sort-order"
              type="number"
              step={1}
              aria-invalid={Boolean(sortOrderError)}
              aria-describedby={describedBy}
              className={cn(
                "h-11 w-full bg-background",
                sortOrderError && "border-destructive focus-visible:ring-destructive/20",
              )}
            />
          )}
        />
      )}
    </FieldGroup>
  );
}
