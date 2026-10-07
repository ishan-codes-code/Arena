"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, ImageOff, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/animate-ui/components/headless/switch";
import { isHttpUrl } from "@/modules/games/schemas";
import type { Game } from "@/modules/games/queries/games";
import { useGameUpdateMutation } from "./game-update-mutation";
import {
  ReadFirstInput,
  ReadFirstTextarea,
  ReadFirstStatusSelect,
} from "./read-first-field";
import { cn } from "@/lib/utils";

export type GameOverviewFormValues = {
  name: string;
  slug: string;
  short_name: string;
  description: string;
  developer: string;
  publisher: string;
  icon_url: string;
  logo_url: string;
  banner_url: string;
  status: Game["status"];
  is_featured: boolean;
  sort_order: number;
};

function getBaselineValues(game: Game): GameOverviewFormValues {
  return {
    name: game.name,
    slug: game.slug,
    short_name: game.short_name ?? "",
    description: game.description ?? "",
    developer: game.developer ?? "",
    publisher: game.publisher ?? "",
    icon_url: game.icon_url ?? "",
    logo_url: game.logo_url ?? "",
    banner_url: game.banner_url ?? "",
    status: game.status,
    is_featured: game.is_featured,
    sort_order: game.sort_order ?? 0,
  };
}

function hasFormChanged(
  baseline: GameOverviewFormValues,
  current: GameOverviewFormValues,
): boolean {
  return (
    baseline.name !== current.name ||
    baseline.slug !== current.slug ||
    baseline.short_name !== current.short_name ||
    baseline.description !== current.description ||
    baseline.developer !== current.developer ||
    baseline.publisher !== current.publisher ||
    baseline.icon_url !== current.icon_url ||
    baseline.logo_url !== current.logo_url ||
    baseline.banner_url !== current.banner_url ||
    baseline.status !== current.status ||
    baseline.is_featured !== current.is_featured ||
    baseline.sort_order !== current.sort_order
  );
}

type ArtworkKind = "icon" | "logo" | "banner";

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
            kind === "banner"
              ? "280px"
              : kind === "logo"
                ? "144px"
                : "64px"
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
          <ImageOff className="size-3.5 text-muted-foreground/60" aria-hidden="true" />
          <span className="text-[10px]">Failed to load</span>
        </div>
      )}
    </div>
  );
}

type GameOverviewTabProps = {
  game: Game;
};

export function GameOverviewTab({ game }: GameOverviewTabProps) {
  const router = useRouter();
  const updateMutation = useGameUpdateMutation();

  const [baseline, setBaseline] = React.useState<GameOverviewFormValues>(() =>
    getBaselineValues(game),
  );
  const [formValues, setFormValues] =
    React.useState<GameOverviewFormValues>(() => getBaselineValues(game));
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof GameOverviewFormValues, string>>
  >({});

  // Sync baseline if server game updates while user is not editing
  const isDirty = React.useMemo(
    () => hasFormChanged(baseline, formValues),
    [baseline, formValues],
  );

  const [prevGame, setPrevGame] = React.useState(game);
  if (prevGame !== game) {
    setPrevGame(game);
    if (!isDirty) {
      const nextBaseline = getBaselineValues(game);
      setBaseline(nextBaseline);
      setFormValues(nextBaseline);
    }
  }

  const updateField = <K extends keyof GameOverviewFormValues>(
    key: K,
    value: GameOverviewFormValues[K],
  ) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    // Clear error on edit
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof GameOverviewFormValues, string>> =
      {};

    const trimmedName = formValues.name.trim();
    if (!trimmedName) {
      nextErrors.name = "Game name is required.";
    } else if (trimmedName.length > 120) {
      nextErrors.name = "Game name must be 120 characters or fewer.";
    }

    const trimmedSlug = formValues.slug.trim();
    if (!trimmedSlug) {
      nextErrors.slug = "Slug is required.";
    } else if (trimmedSlug.length > 100) {
      nextErrors.slug = "Slug must be 100 characters or fewer.";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSlug)) {
      nextErrors.slug =
        "Use lowercase letters and numbers separated by single hyphens.";
    }

    if (formValues.short_name && formValues.short_name.trim().length > 40) {
      nextErrors.short_name = "Short name must be 40 characters or fewer.";
    }

    if (
      formValues.description &&
      formValues.description.trim().length > 10000
    ) {
      nextErrors.description = "Description must be 10,000 characters or fewer.";
    }

    if (formValues.developer && formValues.developer.trim().length > 120) {
      nextErrors.developer = "Developer must be 120 characters or fewer.";
    }

    if (formValues.publisher && formValues.publisher.trim().length > 120) {
      nextErrors.publisher = "Publisher must be 120 characters or fewer.";
    }

    if (formValues.icon_url && !isHttpUrl(formValues.icon_url)) {
      nextErrors.icon_url = "Enter a complete HTTP or HTTPS URL.";
    }

    if (formValues.logo_url && !isHttpUrl(formValues.logo_url)) {
      nextErrors.logo_url = "Enter a complete HTTP or HTTPS URL.";
    }

    if (formValues.banner_url && !isHttpUrl(formValues.banner_url)) {
      nextErrors.banner_url = "Enter a complete HTTP or HTTPS URL.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCancel = () => {
    setFormValues(baseline);
    setErrors({});
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isDirty || updateMutation.isPending) return;

    if (!validate()) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }

    const payload = {
      id: game.id,
      name: formValues.name.trim(),
      slug: formValues.slug.trim(),
      short_name: formValues.short_name.trim() || null,
      description: formValues.description.trim() || null,
      developer: formValues.developer.trim() || null,
      publisher: formValues.publisher.trim() || null,
      icon_url: formValues.icon_url.trim() || null,
      logo_url: formValues.logo_url.trim() || null,
      banner_url: formValues.banner_url.trim() || null,
      status: formValues.status,
      is_featured: formValues.is_featured,
      sort_order: Number(formValues.sort_order),
    };

    updateMutation.mutate(payload, {
      onSuccess: (updatedGame) => {
        const nextBaseline: GameOverviewFormValues = {
          name: updatedGame.name,
          slug: updatedGame.slug,
          short_name: updatedGame.short_name ?? "",
          description: updatedGame.description ?? "",
          developer: updatedGame.developer ?? "",
          publisher: updatedGame.publisher ?? "",
          icon_url: updatedGame.icon_url ?? "",
          logo_url: updatedGame.logo_url ?? "",
          banner_url: updatedGame.banner_url ?? "",
          status: updatedGame.status,
          is_featured: updatedGame.is_featured,
          sort_order: updatedGame.sort_order,
        };
        setBaseline(nextBaseline);
        setFormValues(nextBaseline);
        setErrors({});

        toast.success("Game updated", {
          description: `Changes for ${updatedGame.name} were saved successfully.`,
        });

        // If the slug was changed, redirect to the new route
        if (updatedGame.slug !== game.slug) {
          router.replace(`/console/games/${updatedGame.slug}`);
        }
      },
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-10 pb-16">
      {/* Group 1: Game Information */}
      <section aria-labelledby="game-info-heading" className="space-y-5">
        <div className="border-b border-border/70 pb-3">
          <h3
            id="game-info-heading"
            className="font-display text-lg font-bold tracking-[-0.03em]"
          >
            Game Information
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Core metadata and descriptive details for this title.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <ReadFirstInput
            id="game-name"
            label="Name"
            required
            value={formValues.name}
            onChange={(v) => updateField("name", v)}
            placeholder="e.g. Free Fire MAX"
            maxLength={120}
            error={errors.name}
          />

          <ReadFirstInput
            id="game-slug"
            label="Slug"
            required
            value={formValues.slug}
            onChange={(v) =>
              updateField("slug", v.toLowerCase().replace(/\s+/g, "-"))
            }
            placeholder="e.g. free-fire-max"
            maxLength={100}
            description="URL identifier"
            error={errors.slug}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <ReadFirstInput
            id="game-short-name"
            label="Short Name"
            value={formValues.short_name}
            onChange={(v) => updateField("short_name", v)}
            placeholder="e.g. FF MAX"
            maxLength={40}
            description="Compact label for mobile/cards"
            error={errors.short_name}
          />
        </div>

        <ReadFirstTextarea
          id="game-description"
          label="Description"
          value={formValues.description}
          onChange={(v) => updateField("description", v)}
          placeholder="What should players know about this game?"
          maxLength={10000}
          rows={3}
          error={errors.description}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <ReadFirstInput
            id="game-developer"
            label="Developer"
            value={formValues.developer}
            onChange={(v) => updateField("developer", v)}
            placeholder="e.g. 111dots Studio"
            maxLength={120}
            error={errors.developer}
          />

          <ReadFirstInput
            id="game-publisher"
            label="Publisher"
            value={formValues.publisher}
            onChange={(v) => updateField("publisher", v)}
            placeholder="e.g. Garena"
            maxLength={120}
            error={errors.publisher}
          />
        </div>
      </section>

      {/* Group 2: Media */}
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
          {/* Icon */}
          <div className="flex flex-col justify-between gap-4 rounded-lg border border-border/60 bg-card/40 p-4 transition-colors hover:border-border">
            <ReadFirstInput
              id="game-icon-url"
              label="Icon URL"
              type="url"
              value={formValues.icon_url}
              onChange={(v) => updateField("icon_url", v)}
              placeholder="https://..."
              description="Square (1:1)"
              error={errors.icon_url}
            />
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/75">
                Artwork Preview
              </span>
              <ArtworkPreview
                src={formValues.icon_url}
                label="Icon"
                kind="icon"
              />
            </div>
          </div>

          {/* Logo */}
          <div className="flex flex-col justify-between gap-4 rounded-lg border border-border/60 bg-card/40 p-4 transition-colors hover:border-border">
            <ReadFirstInput
              id="game-logo-url"
              label="Logo URL"
              type="url"
              value={formValues.logo_url}
              onChange={(v) => updateField("logo_url", v)}
              placeholder="https://..."
              description="Transparent / wide (3:1)"
              error={errors.logo_url}
            />
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/75">
                Artwork Preview
              </span>
              <ArtworkPreview
                src={formValues.logo_url}
                label="Logo"
                kind="logo"
              />
            </div>
          </div>

          {/* Banner */}
          <div className="flex flex-col justify-between gap-4 rounded-lg border border-border/60 bg-card/40 p-4 transition-colors hover:border-border">
            <ReadFirstInput
              id="game-banner-url"
              label="Banner URL"
              type="url"
              value={formValues.banner_url}
              onChange={(v) => updateField("banner_url", v)}
              placeholder="https://..."
              description="16:9 widescreen"
              error={errors.banner_url}
            />
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/75">
                Artwork Preview
              </span>
              <ArtworkPreview
                src={formValues.banner_url}
                label="Banner"
                kind="banner"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Group 3: Publishing */}
      <section aria-labelledby="publishing-heading" className="space-y-5">
        <div className="border-b border-border/70 pb-3">
          <h3
            id="publishing-heading"
            className="font-display text-lg font-bold tracking-[-0.03em]"
          >
            Publishing
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Control visibility, display order, and promotional highlights.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <ReadFirstStatusSelect
            id="game-status"
            label="Status"
            value={formValues.status}
            onChange={(v) => updateField("status", v)}
            description="Catalog lifecycle state"
          />

          <ReadFirstInput
            id="game-sort-order"
            label="Sort Order"
            type="number"
            value={formValues.sort_order}
            onChange={(v) => updateField("sort_order", Number(v) || 0)}
            description="Lower numbers appear first"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between rounded-md border border-border/70 bg-muted/20 p-4 transition-colors hover:border-foreground/30 hover:bg-muted/30">
            <div className="space-y-0.5">
              <label
                htmlFor="game-featured-toggle"
                className="cursor-pointer text-sm font-medium"
              >
                Featured Game
              </label>
              <p className="text-xs text-muted-foreground">
                Give this game a prominent position across Arena featured carousels.
              </p>
            </div>
            <Switch
              id="game-featured-toggle"
              checked={formValues.is_featured}
              onChange={(checked) =>
                updateField("is_featured", Boolean(checked))
              }
              className="h-6 w-11 cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Metadata Read-Only Section */}
      <section
        aria-label="Game metadata"
        className="rounded-lg border border-border/60 bg-muted/10 p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-wider">Game ID:</span>
            <span className="select-all rounded-sm bg-muted/50 px-1.5 py-0.5 text-foreground">
              {game.id}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span>
              Created:{" "}
              <span className="text-foreground">
                {new Date(game.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </span>
            <span aria-hidden="true">•</span>
            <span>
              Updated:{" "}
              <span className="text-foreground">
                {new Date(game.updated_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-0 z-20 -mx-4 -mb-16 border-t border-border bg-background/95 px-4 py-3.5 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            {isDirty ? (
              <span className="flex items-center gap-1.5 font-medium text-amber-500 dark:text-amber-400">
                <AlertCircle className="size-3.5" aria-hidden="true" />
                Unsaved changes
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Check className="size-3.5 text-live" aria-hidden="true" />
                All changes saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
              className="h-10 cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
              className="h-10 min-w-32 cursor-pointer"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
