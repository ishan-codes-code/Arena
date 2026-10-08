"use client";

import * as React from "react";
import {
  AlertCircle,
  ChevronRight,
  Layers,
  Plus,
  RotateCcw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGameModesQuery, type GameMode } from "@/modules/games/queries/modes";
import type { Game } from "@/modules/games/queries/games";
import { cn } from "@/lib/utils";
import { SelectedModePanel } from "./selected-mode-panel";

type GameModesTabProps = {
  game: Game;
};

function ModeStatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-live/30 bg-live/10 px-2 py-0.5 text-xs font-medium text-live">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-live shrink-0" />
        <span>Active</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground">
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-muted-foreground/60 shrink-0"
      />
      <span>Inactive</span>
    </span>
  );
}

function GameModeListItem({
  mode,
  isSelected,
  onSelect,
}: {
  mode: GameMode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      data-selected={isSelected ? "true" : undefined}
      className={cn(
        "group relative flex w-full flex-col justify-between gap-3 rounded-lg border p-3.5 sm:p-4 text-left transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
        isSelected
          ? "border-primary/70 bg-primary/[0.04] shadow-xs ring-1 ring-primary/40"
          : "border-border/70 bg-card/60 hover:border-border hover:bg-card",
      )}
    >
      <div className="space-y-1 w-full min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4
            className={cn(
              "font-display text-base font-bold tracking-[-0.02em] transition-colors",
              isSelected ? "text-primary" : "text-foreground group-hover:text-primary",
            )}
          >
            {mode.name}
          </h4>
          <ModeStatusBadge active={mode.active} />
        </div>

        <p className="font-mono text-xs text-muted-foreground">
          slug: <span className="text-foreground/90">{mode.slug}</span>
        </p>

        {mode.description && (
          <p className="line-clamp-2 pt-0.5 text-xs leading-relaxed text-muted-foreground">
            {mode.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-foreground/80">
          <Users className="size-3 text-muted-foreground" aria-hidden="true" />
          <span>
            {mode.max_players_per_match}{" "}
            {mode.max_players_per_match === 1 ? "player" : "players"} / match
          </span>
        </span>
        <ChevronRight
          className={cn(
            "size-4 transition-transform duration-150",
            isSelected
              ? "text-primary translate-x-0.5"
              : "text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5",
          )}
          aria-hidden="true"
        />
      </div>
    </button>
  );
}

function GameModesLeftSkeleton() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Loading game modes">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`mode-left-skeleton-${index}`}
          className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card/40 p-3.5 sm:p-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32 sm:w-40" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
          <Skeleton className="h-3 w-24 font-mono" />
          <div className="border-t border-border/40 pt-2">
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SelectedModeSkeleton() {
  return (
    <div
      className="space-y-6 rounded-xl border border-border/70 bg-card/40 p-4 sm:p-6 shadow-xs"
      aria-busy="true"
      aria-label="Loading selected mode details"
    >
      <div className="flex items-center justify-between border-b border-border/70 pb-5">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 sm:w-64" />
          <Skeleton className="h-4 w-32 font-mono" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`summary-skeleton-${index}`}
            className="rounded-lg border border-border/70 bg-card/60 p-3.5 sm:p-4 space-y-2"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        <Skeleton className="h-5 w-40" />
        <div className="rounded-lg border border-border/70 bg-card/60 p-4">
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
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
        define match types, team structures, and player limits for tournaments.
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

  const [selectedModeId, setSelectedModeId] = React.useState<string | null>(null);

  // Derive active selected mode, defaulting to first mode in the list
  const activeSelectedId =
    selectedModeId && modes.some((m) => m.id === selectedModeId)
      ? selectedModeId
      : (modes[0]?.id ?? null);

  const selectedMode = modes.find((m) => m.id === activeSelectedId) ?? null;

  return (
    <section aria-labelledby="game-modes-heading" className="space-y-6 pb-16">
      {/* Modes Workspace Content */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            <GameModesLeftSkeleton />
          </div>
          <div className="lg:col-span-7 xl:col-span-8">
            <SelectedModeSkeleton />
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left Panel: Modes Selection List */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div className="flex items-center gap-2">
                <h3
                  id="game-modes-heading"
                  className="font-display text-base font-bold tracking-[-0.02em] text-foreground sm:text-lg"
                >
                  Game Modes
                </h3>
                <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/60 px-2 py-0.2 font-mono text-[11px] font-medium text-muted-foreground">
                  {modes.length}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                className="h-8 gap-1.5 text-xs text-muted-foreground"
                title="Add Mode modal will be available in an upcoming update"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Add Mode
              </Button>
            </div>

            <ul
              role="list"
              className="grid gap-2.5"
              aria-label={`${game.name} game modes`}
            >
              {modes.map((mode) => (
                <li key={mode.id}>
                  <GameModeListItem
                    mode={mode}
                    isSelected={mode.id === activeSelectedId}
                    onSelect={() => setSelectedModeId(mode.id)}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Right Panel: Selected Mode Workspace */}
          <div className="lg:col-span-7 xl:col-span-8 min-w-0">
            {selectedMode ? (
              <SelectedModePanel mode={selectedMode} />
            ) : (
              <SelectedModeSkeleton />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
