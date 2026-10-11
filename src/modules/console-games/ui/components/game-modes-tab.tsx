"use client";

import * as React from "react";
import {
  AlertCircle,
  Layers,
  Plus,
  RotateCcw,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGameModesQuery,
  useModeTeamConfigsQuery,
  type GameMode,
} from "@/modules/games/queries/modes";
import type { Game } from "@/modules/games/queries/games";
import { cn } from "@/lib/utils";
import { SelectedModePanel } from "./selected-mode-panel";

type GameModesTabProps = {
  game: Game;
};

function ModeStatusDot({ active }: { active: boolean }) {
  return (
    <span aria-hidden="true" className="relative size-2 shrink-0 rounded-full">
      <span
        className={cn(
          "absolute inset-0 rounded-full",
          active ? "bg-live" : "bg-muted-foreground/50",
        )}
      />
    </span>
  );
}

function ModeStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      aria-label={active ? "Active" : "Inactive"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        active
          ? "border-live/30 bg-live/10 text-live"
          : "border-border/80 bg-muted/40 text-muted-foreground",
      )}
    >
      <ModeStatusDot active={active} />
      <span className="sr-only">{active ? "Active" : "Inactive"}</span>
      <span aria-hidden="true">{active ? "Active" : "Inactive"}</span>
    </span>
  );
}

function GameModeListItem({
  mode,
  isSelected,
  onSelect,
  prefersReducedMotion,
}: {
  mode: GameMode;
  isSelected: boolean;
  onSelect: () => void;
  prefersReducedMotion: boolean;
}) {
  return (
    <motion.button
      layout={!prefersReducedMotion}
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      data-selected={isSelected ? "true" : undefined}
      data-testid={`mode-row-${mode.id}`}
      className={cn(
        "group relative flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left outline-none transition-colors duration-150",
        isSelected
          ? "border-primary/70 bg-primary/[0.04]"
          : "border-transparent bg-card/40 hover:border-border hover:bg-muted/50",
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <ModeStatusDot active={mode.active} />
        <h4
          className={cn(
            "truncate font-display text-sm font-bold tracking-[-0.02em]",
            isSelected ? "text-primary" : "text-foreground",
          )}
        >
          {mode.name}
        </h4>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="hidden items-center gap-1 font-mono text-xs text-muted-foreground sm:inline-flex">
          <svg
            aria-hidden="true"
            className="size-3 shrink-0 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 7v3l3 3"
            />
          </svg>
          <span>{mode.max_players_per_match}</span>
        </span>
        <ModeStatusBadge active={mode.active} />
      </div>

      {isSelected && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-primary"
        />
      )}
    </motion.button>
  );
}

function GameModesListSkeleton() {
  return (
    <div className="grid gap-2.5" aria-busy="true" aria-label="Loading game modes">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`mode-skeleton-${index}`}
          className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5"
        >
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-2 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function SelectedModeSkeleton() {
  return (
    <div
      className="space-y-6 rounded-xl border border-border/70 bg-card/40 p-4 sm:p-6"
      aria-busy="true"
      aria-label="Loading selected mode details"
    >
      <div className="flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <Skeleton className="h-7 w-48 sm:w-64" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-3 w-32 font-mono" />
          <Skeleton className="mt-1 h-3 w-full max-w-sm" />
        </div>
        <Skeleton className="mt-2 h-8 w-24 rounded-lg sm:mt-0" />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`summary-skeleton-${index}`}
            className="rounded-lg border border-border/70 bg-card/60 p-3.5 sm:p-4"
          >
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
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

/**
 * The master-detail breakpoint. Below this, the workspace uses a two-step
 * master–detail interaction (list → details with back navigation). Above this,
 * the list and details are shown side by side.
 */
const MASTER_DETAIL_BREAKPOINT = "lg";

export function GameModesTab({ game }: GameModesTabProps) {
  const { data, isLoading, isError, error, refetch } = useGameModesQuery(game.id);
  const modes = data?.modes ?? [];

  const [selectedModeId, setSelectedModeId] = React.useState<string | null>(null);
  // Separate mobile view state from selection state:
  // 'list' shows the mode list only, 'details' shows the master-detail panel
  const [mobileView, setMobileView] = React.useState<'list' | 'details'>('list');
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Desktop: auto-select first mode when nothing selected.
  // Mobile: valid selection or first mode fallback for details view.
  const activeSelectedId =
    selectedModeId && modes.some((m) => m.id === selectedModeId)
      ? selectedModeId
      : (modes[0]?.id ?? null);

  const selectedMode = modes.find((m) => m.id === activeSelectedId) ?? null;

  // Mobile details view: the mode being viewed. Falls back to first mode if selection invalid.
  const mobileDetailsId =
    mobileView === 'details' && selectedModeId && modes.some((m) => m.id === selectedModeId)
      ? selectedModeId
      : mobileView === 'details' && activeSelectedId
        ? activeSelectedId
        : null;

  // Fetch team configs for the mode currently being viewed:
  // - On desktop: activeSelectedId (always valid when modes exist)
  // - On mobile details: the mode being viewed
  // - On mobile list: no fetch (disabled, cache retained)
  const configModeId = mobileView === 'list' ? null : activeSelectedId;

  const {
    data: configsData,
    isLoading: isConfigsLoading,
    isError: isConfigsError,
    error: configsError,
    refetch: refetchConfigs,
  } = useModeTeamConfigsQuery(configModeId ?? "", {
    enabled: Boolean(configModeId),
  });

  // Mobile details mode: the mode rendered in the mobile details panel.
  const mobileDetailsMode = modes.find((m) => m.id === mobileDetailsId) ?? null;

  if (isLoading) {
    return (
      <section aria-labelledby="game-modes-heading" className="space-y-6 pb-16">
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <GameModesListSkeleton />
      </section>
    );
  }

  if (isError) {
    return (
      <section aria-labelledby="game-modes-heading">
        <GameModesErrorState
          errorMessage={error?.message}
          onRetry={() => void refetch()}
        />
      </section>
    );
  }

  if (!isLoading && !isError && modes.length === 0) {
    return (
      <section aria-labelledby="game-modes-heading">
        <GameModesEmptyState gameName={game.name} />
      </section>
    );
  }

  return (
    <section aria-labelledby="game-modes-heading" className="space-y-6 pb-16">
      {/* Desktop: Two-column master–detail workspace */}
      <div className={`hidden ${MASTER_DETAIL_BREAKPOINT}:grid ${MASTER_DETAIL_BREAKPOINT}:grid-cols-12 ${MASTER_DETAIL_BREAKPOINT}:items-start ${MASTER_DETAIL_BREAKPOINT}:gap-6 xl:${MASTER_DETAIL_BREAKPOINT}:gap-8`}>
        {/* Left Column: Compact Modes Navigation */}
        <nav
          id="mode-list-nav"
          aria-label="Game modes navigation"
          className={`col-span-5 xl:col-span-4 space-y-3`}
        >
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

          <ul role="list" className="grid gap-2">
            {modes.map((mode) => {
              const isModeSelected: boolean = mode.id === activeSelectedId ? true : false;
              return (
                <li key={mode.id}>
                  <GameModeListItem
                    mode={mode}
                    isSelected={isModeSelected}
                    onSelect={() => setSelectedModeId(mode.id)}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right Column: Selected Mode Workspace */}
        <div className="col-span-7 xl:col-span-8 min-w-0">
          {selectedMode ? (
            <SelectedModePanel
              mode={selectedMode}
              configs={configsData?.configurations ?? null}
              isConfigsLoading={isConfigsLoading}
              isConfigsError={isConfigsError}
              configsError={configsError}
              refetchConfigs={refetchConfigs}
            />
          ) : (
            <SelectedModeSkeleton />
          )}
        </div>
      </div>

      {/* Mobile: Two-step master–detail interaction */}
      <div className="lg:hidden">
        {mobileView === 'details' && mobileDetailsMode ? (
          <SelectedModePanel
            mode={mobileDetailsMode}
            configs={configsData?.configurations ?? null}
            isConfigsLoading={isConfigsLoading}
            isConfigsError={isConfigsError}
            configsError={configsError}
            refetchConfigs={refetchConfigs}
            backButton={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setMobileView('list')}
              >
                ← Back to Modes
              </Button>
            }
          />
        ) : (
          <CompactModeListMobile
            modes={modes}
            activeSelectedId={selectedModeId}
            onSelect={(id) => {
              setSelectedModeId(id);
              setMobileView('details');
            }}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}
      </div>
    </section>
  );
}

function CompactModeListMobile({
  modes,
  activeSelectedId,
  onSelect,
  prefersReducedMotion,
}: {
  modes: GameMode[];
  activeSelectedId: string | null;
  onSelect: (id: string) => void;
  prefersReducedMotion: boolean;
}) {
  return (
    <div className="space-y-3">
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

      <ul role="list" className="grid gap-2" aria-label="Game modes list">
        {modes.map((mode) => {
          const isModeSelected: boolean = mode.id === activeSelectedId ? true : false;
          return (
            <li key={mode.id}>
              <GameModeListItem
                mode={mode}
                isSelected={isModeSelected}
                onSelect={() => onSelect(mode.id)}
                prefersReducedMotion={prefersReducedMotion}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
