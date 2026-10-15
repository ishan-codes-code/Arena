"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { UseFormReturn } from "react-hook-form";
import { ImageOff } from "lucide-react";

import { FieldGroup } from "@/components/ui/field";
import { SmoothInput } from "@/components/ui/skiper-ui/skiper106";
import { cn } from "@/lib/utils";
import { isHttpUrl } from "@/modules/games/schemas";
import type { GameFormInput, GameFormValues } from "./game-form-schema";
import { FieldFrame } from "./form-field-primitives";

const controlWrapperClassName =
  "w-full min-w-0 max-w-full rounded-md border border-input bg-background p-0 transition-colors focus-within:border-ring focus-within:outline-none focus-within:ring-3 focus-within:ring-ring/40";
const controlClassName =
  "h-10 w-full min-w-0 max-w-full px-3 text-sm text-foreground placeholder:text-muted-foreground";

type GameForm = UseFormReturn<GameFormInput, undefined, GameFormValues>;
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
