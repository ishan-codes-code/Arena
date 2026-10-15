"use client";

import * as React from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Game } from "@/modules/games/queries/games";
import { GameOverviewArtworkFields } from "./game-overview-artwork-fields";
import {
  ReadFirstInput,
  ReadFirstStatusSelect,
  ReadFirstTextarea,
} from "./read-first-field";

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

type GameOverviewErrors = Partial<
  Record<keyof GameOverviewFormValues, string>
>;

type UpdateGameOverviewField = <K extends keyof GameOverviewFormValues>(
  key: K,
  value: GameOverviewFormValues[K],
) => void;

type GameOverviewTabFormProps = {
  game: Game;
  formValues: GameOverviewFormValues;
  errors: GameOverviewErrors;
  isDirty: boolean;
  isPending: boolean;
  onFieldChange: UpdateGameOverviewField;
  onSave: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

function GameInformationFields({
  values,
  errors,
  onFieldChange,
}: {
  values: GameOverviewFormValues;
  errors: GameOverviewErrors;
  onFieldChange: UpdateGameOverviewField;
}) {
  return (
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
          value={values.name}
          onChange={(value) => onFieldChange("name", value)}
          placeholder="e.g. Free Fire MAX"
          maxLength={120}
          error={errors.name}
        />

        <ReadFirstInput
          id="game-slug"
          label="Slug"
          required
          value={values.slug}
          onChange={(value) =>
            onFieldChange("slug", value.toLowerCase().replace(/\s+/g, "-"))
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
          value={values.short_name}
          onChange={(value) => onFieldChange("short_name", value)}
          placeholder="e.g. FF MAX"
          maxLength={40}
          description="Compact label for mobile/cards"
          error={errors.short_name}
        />
      </div>

      <ReadFirstTextarea
        id="game-description"
        label="Description"
        value={values.description}
        onChange={(value) => onFieldChange("description", value)}
        placeholder="What should players know about this game?"
        maxLength={10000}
        rows={3}
        error={errors.description}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <ReadFirstInput
          id="game-developer"
          label="Developer"
          value={values.developer}
          onChange={(value) => onFieldChange("developer", value)}
          placeholder="e.g. 111dots Studio"
          maxLength={120}
          error={errors.developer}
        />

        <ReadFirstInput
          id="game-publisher"
          label="Publisher"
          value={values.publisher}
          onChange={(value) => onFieldChange("publisher", value)}
          placeholder="e.g. Garena"
          maxLength={120}
          error={errors.publisher}
        />
      </div>
    </section>
  );
}

function PublishingFields({
  values,
  onFieldChange,
}: {
  values: GameOverviewFormValues;
  onFieldChange: UpdateGameOverviewField;
}) {
  return (
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
          value={values.status}
          onChange={(value) => onFieldChange("status", value)}
          description="Catalog lifecycle state"
        />

        <ReadFirstInput
          id="game-sort-order"
          label="Sort Order"
          type="number"
          value={values.sort_order}
          onChange={(value) => onFieldChange("sort_order", Number(value) || 0)}
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
            checked={values.is_featured}
            onCheckedChange={(checked) =>
              onFieldChange("is_featured", Boolean(checked))
            }
            className="h-6 w-11 cursor-pointer"
          />
        </div>
      </div>
    </section>
  );
}

function GameMetadata({ game }: { game: Game }) {
  return (
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
  );
}

function StickyActions({
  isDirty,
  isPending,
  onCancel,
}: {
  isDirty: boolean;
  isPending: boolean;
  onCancel: () => void;
}) {
  return (
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
            onClick={onCancel}
            disabled={isPending}
            className="h-10 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={!isDirty || isPending}
            className="h-10 min-w-32 cursor-pointer"
          >
            {isPending ? (
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
  );
}

export function GameOverviewTabForm({
  game,
  formValues,
  errors,
  isDirty,
  isPending,
  onFieldChange,
  onSave,
  onCancel,
}: GameOverviewTabFormProps) {
  return (
    <form onSubmit={onSave} className="space-y-10 pb-16">
      <GameInformationFields
        values={formValues}
        errors={errors}
        onFieldChange={onFieldChange}
      />
      <GameOverviewArtworkFields
        values={formValues}
        errors={errors}
        onFieldChange={onFieldChange}
      />
      <PublishingFields values={formValues} onFieldChange={onFieldChange} />
      <GameMetadata game={game} />
      <StickyActions
        isDirty={isDirty}
        isPending={isPending}
        onCancel={onCancel}
      />
    </form>
  );
}