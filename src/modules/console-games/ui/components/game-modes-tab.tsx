"use client";

import * as React from "react";
import {
  AlertCircle,
  ArrowLeft,
  Layers,
  Plus,
  RotateCcw,
  Users,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGameModesQuery,
  useModeTeamConfigsQuery,
  type GameMode,
} from "@/modules/games/queries/modes";
import type { Game } from "@/modules/games/queries/games";
import { useMediaQuery } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { SelectedModePanel } from "./selected-mode-panel";
import { AddGameModeForm } from "./add-game-mode-form";

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
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        active
          ? "border-live/30 bg-live/10 text-live"
          : "border-border/80 bg-muted/40 text-muted-foreground",
      )}
    >
      <ModeStatusDot active={active} />
      <span>{active ? "Active" : "Inactive"}</span>
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
        // Base styles — no relative positioning needed since indicator is removed
        "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left outline-none",
        "transition-colors duration-150 motion-reduce:transition-none",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
        // Selected: subtle muted surface with a standard border — no primary/red treatment
        isSelected
          ? "border-border-strong bg-muted/60"
          : "border-transparent bg-card/40 hover:border-border hover:bg-muted/30",
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <ModeStatusDot active={mode.active} />
        {/* Keep mode name in foreground — no primary color for selection */}
        <span className="block truncate font-display text-sm font-bold tracking-[-0.02em] text-foreground">
          {mode.name}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <span
          className="hidden items-center gap-1 font-mono text-xs text-muted-foreground sm:inline-flex"
          title={`Maximum ${mode.max_players_per_match} players per match`}
          aria-label={`${mode.max_players_per_match} max players`}
        >
          <Users className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span>{mode.max_players_per_match}</span>
        </span>
        <ModeStatusBadge active={mode.active} />
      </div>
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

function GameModesEmptyState({
  gameName,
  onAddMode,
}: {
  gameName: string;
  onAddMode?: () => void;
}) {
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
      {onAddMode && (
        <div className="mt-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddMode}
            className="h-8 gap-1.5 text-xs"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add Mode
          </Button>
        </div>
      )}
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
 * Mobile transition variants.
 *
 * Entry (list → details): slides in from the right with a slight opacity fade.
 * Exit (details → list): slides out to the right — restrained, matching Arena's motion language.
 * Reduced-motion: opacity-only, no translation.
 */
const mobileDetailVariants = {
  initial: (reduced: boolean) => ({
    opacity: 0,
    x: reduced ? 0 : 16,
  }),
  animate: (reduced: boolean) => ({
    opacity: 1,
    x: 0,
    transition: { duration: reduced ? 0 : 0.18, ease: "easeOut" as const },
  }),
  exit: (reduced: boolean) => ({
    opacity: 0,
    x: reduced ? 0 : 16,
    transition: { duration: reduced ? 0 : 0.14, ease: "easeIn" as const },
  }),
};

const mobileListVariants = {
  initial: (reduced: boolean) => ({
    opacity: 0,
    x: reduced ? 0 : -8,
  }),
  animate: (reduced: boolean) => ({
    opacity: 1,
    x: 0,
    transition: { duration: reduced ? 0 : 0.18, ease: "easeOut" as const },
  }),
  exit: (reduced: boolean) => ({
    opacity: 0,
    x: reduced ? 0 : -8,
    transition: { duration: reduced ? 0 : 0.12, ease: "easeIn" as const },
  }),
};

export function GameModesTab({ game }: GameModesTabProps) {
  const { data, isLoading, isError, error, refetch } = useGameModesQuery(game.id);
  const modes = data?.modes ?? [];

  const [selectedModeId, setSelectedModeId] = React.useState<string | null>(null);
  // Separate mobile view state ('list' | 'details') for single-column viewport flow
  const [mobileView, setMobileView] = React.useState<"list" | "details">("list");
  const [isAddModeOpen, setIsAddModeOpen] = React.useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Responsive layout state: matches Tailwind's lg: breakpoint (1024px)
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Derive the valid active selection without mutating state during render.
  // If the currently stored ID is no longer in the modes list, fall back to the
  // first mode (for desktop auto-selection) or treat as unselected (for mobile).
  const isSelectionValid =
    selectedModeId !== null && modes.some((m) => m.id === selectedModeId);

  const activeSelectedId = isSelectionValid
    ? selectedModeId
    : (modes[0]?.id ?? null);

  const selectedMode = modes.find((m) => m.id === activeSelectedId) ?? null;

  // If the available modes change and the previously selected ID is no longer
  // present, we need to reset selection. We detect this by tracking the previous
  // value of modes using a ref — the state update is then called during render
  // (not in an effect body), which is React's approved pattern for "state derived
  // from incoming data". It triggers one extra synchronous re-render before the
  // browser paints, avoiding a flash of invalid selection state, and does not
  // fall afoul of the react-hooks/set-state-in-effect rule.
  const prevModesRef = React.useRef(modes);
  if (prevModesRef.current !== modes) {
    prevModesRef.current = modes;
    if (selectedModeId !== null && modes.length > 0 && !isSelectionValid) {
      setSelectedModeId(null);
      if (mobileView === "details") {
        setMobileView("list");
      }
    }
  }

  // Derive which mode's configuration panel is actually rendered:
  // - On desktop: activeSelectedId (details panel is always visible side-by-side)
  // - On mobile details view: activeSelectedId (details panel is visible)
  // - On mobile list view: null (only list is rendered; configurations query is disabled)
  const configModeId = isDesktop
    ? activeSelectedId
    : mobileView === "details"
      ? activeSelectedId
      : null;

  const {
    data: configsData,
    isLoading: isConfigsQueryLoading,
    isError: isConfigsError,
    error: configsError,
    refetch: refetchConfigs,
  } = useModeTeamConfigsQuery(configModeId ?? "", {
    enabled: Boolean(configModeId),
  });

  // Ensure loading skeleton displays while query is enabled and awaiting initial data
  const isConfigsLoading =
    isConfigsQueryLoading ||
    (Boolean(configModeId) && configsData === undefined && !isConfigsError);

  // Prevent stale configurations from a previously selected mode from appearing
  // under the currently selected mode while a new query is in flight.
  const displayedConfigs = React.useMemo(() => {
    if (!configsData?.configurations || !selectedMode) return null;
    return configsData.configurations.filter((c) => c.mode_id === selectedMode.id);
  }, [configsData, selectedMode]);

  if (isLoading) {
    return (
      <section aria-label="Game modes" className="space-y-6 pb-16">
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
      <section aria-label="Game modes">
        <GameModesErrorState
          errorMessage={error?.message}
          onRetry={() => void refetch()}
        />
      </section>
    );
  }

  if (!isLoading && !isError && modes.length === 0) {
    return (
      <section aria-label="Game modes">
        <GameModesEmptyState
          gameName={game.name}
          onAddMode={() => setIsAddModeOpen(true)}
        />
        <AddGameModeForm
          open={isAddModeOpen}
          onOpenChange={setIsAddModeOpen}
        />
      </section>
    );
  }

  return (
    <section aria-label="Game modes" className="space-y-6 pb-16">
      {/* Desktop: Two-column master–detail workspace (>= 1024px) */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:items-start lg:gap-6 xl:gap-8">
        {/* Left Column: Compact Modes Navigation */}
        <nav
          id="mode-list-nav-desktop"
          aria-label="Game modes navigation"
          className="col-span-5 xl:col-span-4 space-y-3"
        >
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2">
              <h3
                id="game-modes-heading-desktop"
                className="font-display text-base font-bold tracking-[-0.02em] text-foreground sm:text-lg"
              >
                Game Modes
              </h3>
              <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                {modes.length}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModeOpen(true)}
              className="h-8 gap-1.5 text-xs"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Add Mode
            </Button>
          </div>

          <ul role="list" className="grid gap-2" aria-label="Desktop game modes list">
            {modes.map((mode) => {
              const isModeSelected = mode.id === activeSelectedId;
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
              configs={displayedConfigs}
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

      {/* Mobile: Two-step master–detail interaction (< 1024px) */}
      {/*
        AnimatePresence with mode="wait" ensures the exiting view fully completes
        its exit before the entering view mounts. This prevents the two panels from
        overlapping during transition.

        Keys are stable string literals so React can reliably track which child is
        entering/exiting. Navigation state (selectedModeId) is preserved independent
        of the animation — back-navigation preserves the selection immediately.
      */}
      <div className="relative overflow-hidden lg:hidden">
        <AnimatePresence mode="wait" initial={false}>
          {mobileView === "details" && selectedMode ? (
            <motion.div
              key="details"
              custom={prefersReducedMotion}
              variants={mobileDetailVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <SelectedModePanel
                mode={selectedMode}
                configs={displayedConfigs}
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
                    onClick={() => setMobileView("list")}
                    aria-label="Back to game modes list"
                  >
                    <ArrowLeft className="size-3.5" aria-hidden="true" />
                    <span>Back to Modes</span>
                  </Button>
                }
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              custom={prefersReducedMotion}
              variants={mobileListVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CompactModeListMobile
                modes={modes}
                activeSelectedId={selectedModeId}
                onSelect={(id) => {
                  setSelectedModeId(id);
                  setMobileView("details");
                }}
                onAddMode={() => setIsAddModeOpen(true)}
                prefersReducedMotion={prefersReducedMotion}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Game Mode Form Modal (Desktop Dialog / Mobile Sheet) */}
      <AddGameModeForm
        open={isAddModeOpen}
        onOpenChange={setIsAddModeOpen}
      />
    </section>
  );
}

function CompactModeListMobile({
  modes,
  activeSelectedId,
  onSelect,
  onAddMode,
  prefersReducedMotion,
}: {
  modes: GameMode[];
  activeSelectedId: string | null;
  onSelect: (id: string) => void;
  onAddMode: () => void;
  prefersReducedMotion: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <h3
            id="game-modes-heading-mobile"
            className="font-display text-base font-bold tracking-[-0.02em] text-foreground sm:text-lg"
          >
            Game Modes
          </h3>
          <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
            {modes.length}
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddMode}
          className="h-8 gap-1.5 text-xs"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Add Mode
        </Button>
      </div>

      <ul role="list" className="grid gap-2" aria-label="Game modes list">
        {modes.map((mode) => {
          const isModeSelected = mode.id === activeSelectedId;
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
