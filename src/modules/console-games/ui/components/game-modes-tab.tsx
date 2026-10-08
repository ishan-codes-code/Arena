"use client";

import * as React from "react";
import {
  AlertCircle,
  Layers,
  Plus,
  RotateCcw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGameModesQuery, type GameMode } from "@/modules/games/queries/modes";
import type { Game } from "@/modules/games/queries/games";

type GameModesTabProps = {
  game: Game;
};

function ModeStatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-live/30 bg-live/10 px-2.5 py-0.5 text-xs font-medium text-live">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-live shrink-0" />
        <span>Active</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-muted-foreground/60 shrink-0"
      />
      <span>Inactive</span>
    </span>
  );
}

function GameModeCard({ mode }: { mode: GameMode }) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-lg border border-border/70 bg-card/60 p-4 sm:p-5 transition-colors duration-150 hover:border-border hover:bg-card">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-display text-base font-bold tracking-[-0.02em] text-foreground sm:text-lg">
            {mode.name}
          </h4>
          <ModeStatusBadge active={mode.active} />
        </div>

        <p className="font-mono text-xs text-muted-foreground">
          slug: <span className="text-foreground/90">{mode.slug}</span>
        </p>

        {mode.description && (
          <p className="pt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {mode.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2.5 py-1 font-mono text-xs text-foreground/80">
          <Users className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <span>
            {mode.max_players_per_match}{" "}
            {mode.max_players_per_match === 1 ? "player" : "players"} / match
          </span>
        </span>
      </div>
    </div>
  );
}

function GameModesSkeleton() {
  return (
    <div className="grid gap-3 sm:gap-4" aria-busy="true" aria-label="Loading game modes">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`mode-skeleton-${index}`}
          className="flex flex-col gap-4 rounded-lg border border-border/60 bg-card/40 p-4 sm:p-5"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40 sm:w-56" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-28 font-mono" />
            <Skeleton className="h-4 w-full max-w-md pt-1" />
          </div>
          <div className="border-t border-border/40 pt-3">
            <Skeleton className="h-6 w-36 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GameModesEmptyState({ gameName }: { gameName: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/10 p-10 text-center sm:p-14"
    >
      <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-card shadow-xs">
        <Layers className="size-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h4 className="mt-4 font-display text-lg font-bold tracking-[-0.03em] text-foreground sm:text-xl">
        No game modes yet
      </h4>
      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
        {gameName} doesn&apos;t have any competition modes configured yet. Modes
        define match types and player limits for tournaments.
      </p>
    </div>
  );
}

function GameModesErrorState({
  errorMessage,
  onRetry,
}: {
  errorMessage?: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center sm:p-10"
    >
      <div className="flex size-11 items-center justify-center rounded-lg border border-destructive/30 bg-background text-destructive shadow-xs">
        <AlertCircle className="size-5.5" aria-hidden="true" />
      </div>
      <h4 className="mt-3.5 font-display text-lg font-bold tracking-[-0.03em] text-foreground">
        Unable to load game modes
      </h4>
      <p className="mt-1 max-w-md text-xs text-muted-foreground sm:text-sm">
        {errorMessage || "There was a problem fetching modes for this title."}
      </p>
      <div className="mt-5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-8 gap-1.5 text-xs"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Retry
        </Button>
      </div>
    </div>
  );
}

export function GameModesTab({ game }: GameModesTabProps) {
  const { data, isLoading, isError, error, refetch } = useGameModesQuery(game.id);
  const modes = data?.modes ?? [];

  return (
    <section aria-labelledby="game-modes-heading" className="space-y-6 pb-16">
      {/* Section Header */}
      <div className="flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            <h3
              id="game-modes-heading"
              className="font-display text-lg font-bold tracking-[-0.03em] text-foreground sm:text-xl"
            >
              Game Modes
            </h3>
            {!isLoading && !isError && (
              <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                {modes.length} {modes.length === 1 ? "mode" : "modes"}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Configure competition formats, match types, and player limits for {game.name}.
          </p>
        </div>

        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            className="h-9 gap-1.5 text-xs text-muted-foreground"
            title="Add Mode modal will be available in an upcoming update"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add Mode
          </Button>
        </div>
      </div>

      {/* Modes Content */}
      <div>
        {isLoading && <GameModesSkeleton />}

        {isError && (
          <GameModesErrorState
            errorMessage={error?.message}
            onRetry={() => void refetch()}
          />
        )}

        {!isLoading && !isError && modes.length === 0 && (
          <GameModesEmptyState gameName={game.name} />
        )}

        {!isLoading && !isError && modes.length > 0 && (
          <ul
            role="list"
            className="grid gap-3 sm:gap-4"
            aria-label={`${game.name} game modes`}
          >
            {modes.map((mode) => (
              <li key={mode.id}>
                <GameModeCard mode={mode} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
