"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { isHttpUrl } from "@/modules/games/schemas";
import { ReadFirstInput } from "./read-first-field";

type ArtworkKind = "icon" | "logo" | "banner";
type ArtworkFieldName = "icon_url" | "logo_url" | "banner_url";

type ArtworkFieldValues = Record<ArtworkFieldName, string>;
type ArtworkFieldErrors = Partial<Record<ArtworkFieldName, string>>;

type GameOverviewArtworkFieldsProps = {
  values: ArtworkFieldValues;
  errors: ArtworkFieldErrors;
  onFieldChange: (key: ArtworkFieldName, value: string) => void;
};

const artworkPreviewAspect: Record<ArtworkKind, string> = {
  icon: "size-16 rounded-lg",
  logo: "w-36 h-14 rounded-md",
  banner: "w-full max-w-[280px] aspect-video rounded-lg",
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
  const [prevSrc, setPrevSrc] = React.useState(src);
  const [loadState, setLoadState] = React.useState<
    "loading" | "loaded" | "failed"
  >("loading");

  if (prevSrc !== src) {
    setPrevSrc(src);
    setLoadState("loading");
  }

  const hasValidUrl = Boolean(src && isHttpUrl(src));

  if (!hasValidUrl) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center border border-dashed border-border/80 bg-muted/20 text-muted-foreground p-2 text-center",
          artworkPreviewAspect[kind],
        )}
      >
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/70">
          No {label.toLowerCase()}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden border border-border bg-card/80 shadow-xs",
        artworkPreviewAspect[kind],
      )}
      aria-busy={loadState === "loading"}
    >
      {loadState !== "failed" && (
        <Image
          src={src}
          alt={`${label} preview`}
          fill
          unoptimized
          sizes={
            kind === "banner" ? "280px" : kind === "logo" ? "144px" : "64px"
          }
          className={cn(
            "object-contain p-1 transition-opacity duration-200",
            loadState === "loaded" ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setLoadState("loaded")}
          onError={() => setLoadState("failed")}
        />
      )}

      {loadState === "loading" && (
        <div
          className="absolute inset-0 grid place-items-center bg-muted/30 text-[11px] text-muted-foreground"
          aria-hidden="true"
        >
          <Loader2 className="size-3.5 animate-spin text-muted-foreground/60" />
        </div>
      )}

      {loadState === "failed" && (
        <div
          role="status"
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-muted/30 text-[11px] text-muted-foreground"
        >
          <ImageOff
            className="size-3.5 text-muted-foreground/60"
            aria-hidden="true"
          />
          <span className="text-[10px]">Failed to load</span>
        </div>
      )}
    </div>
  );
}

export function GameOverviewArtworkFields({
  values,
  errors,
  onFieldChange,
}: GameOverviewArtworkFieldsProps) {
  return (
    <section aria-labelledby="media-heading" className="space-y-5">
      <div className="border-b border-border/70 pb-3">
        <h3
          id="media-heading"
          className="font-display text-lg font-bold tracking-[-0.03em]"
        >
          Media
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Visual artwork for game cards, hero carousels, and listings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col justify-between gap-4 rounded-lg border border-border/60 bg-card/40 p-4 transition-colors hover:border-border">
          <ReadFirstInput
            id="game-icon-url"
            label="Icon URL"
            type="url"
            value={values.icon_url}
            onChange={(value) => onFieldChange("icon_url", value)}
            placeholder="https://..."
            description="Square (1:1)"
            error={errors.icon_url}
          />
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/75">
              Artwork Preview
            </span>
            <ArtworkPreview
              src={values.icon_url}
              label="Icon"
              kind="icon"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-lg border border-border/60 bg-card/40 p-4 transition-colors hover:border-border">
          <ReadFirstInput
            id="game-logo-url"
            label="Logo URL"
            type="url"
            value={values.logo_url}
            onChange={(value) => onFieldChange("logo_url", value)}
            placeholder="https://..."
            description="Transparent / wide (3:1)"
            error={errors.logo_url}
          />
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/75">
              Artwork Preview
            </span>
            <ArtworkPreview
              src={values.logo_url}
              label="Logo"
              kind="logo"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-lg border border-border/60 bg-card/40 p-4 transition-colors hover:border-border">
          <ReadFirstInput
            id="game-banner-url"
            label="Banner URL"
            type="url"
            value={values.banner_url}
            onChange={(value) => onFieldChange("banner_url", value)}
            placeholder="https://..."
            description="16:9 widescreen"
            error={errors.banner_url}
          />
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/75">
              Artwork Preview
            </span>
            <ArtworkPreview
              src={values.banner_url}
              label="Banner"
              kind="banner"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
