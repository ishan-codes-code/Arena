"use client";

import {
  AlertCircle,
  ArrowLeft,
  Layers,
  Plus,
  RotateCcw,
  Trash2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MotionConfig } from "motion/react";

import { Button } from "@/components/ui/button";
import {
  RippleButton,
  RippleButtonRipples,
} from "@/components/animate-ui/components/buttons/ripple";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  GameMode,
  ModeTeamConfiguration,
} from "@/modules/games/queries/modes";
import { cn } from "@/lib/utils";
import { SelectedModePanel } from "./selected-mode-panel";

export type ModeDetailsPresentation = {
  configs: ModeTeamConfiguration[] | null;
  isConfigsLoading: boolean;
  isConfigsError: boolean;
  configsError: Error | unknown;
  refetchConfigs: () => void;
};

function ModeStatusDot({ active }: { active: boolean }) {
  return (
    <span
      role="img"
      aria-label={active ? "Active" : "Inactive"}
      className="relative size-2 shrink-0 rounded-full"
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full",
          active ? "bg-live" : "bg-muted-foreground/50",
        )}
      />
    </span>
  );
}

function GameModeListItem({
  mode,
  isSelected,
  onSelect,
  onRequestDeleteMode,
  isDeletePending,
  prefersReducedMotion,
}: {
  mode: GameMode;
  isSelected: boolean;
  onSelect: () => void;
  onRequestDeleteMode: (mode: GameMode) => void;
  isDeletePending: boolean;
  prefersReducedMotion: boolean;
}) {
  return (
    <motion.div
      layout={!prefersReducedMotion}
      className={cn(
        "relative flex w-full min-w-0 items-center rounded-lg border transition-colors duration-150 motion-reduce:transition-none",
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50",
        isSelected
          ? "border-border-strong bg-muted/60"
          : "border-transparent bg-card/40 hover:border-border hover:bg-muted/30",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        data-selected={isSelected ? "true" : undefined}
        data-testid={`mode-row-${mode.id}`}
        className={cn(
          "flex min-w-0 flex-1 items-center justify-between rounded-lg py-2.5 pl-3 pr-12 text-left outline-none",
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50",
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <ModeStatusDot active={mode.active} />
          <span className="block truncate font-display text-sm font-bold tracking-[-0.02em] text-foreground">
            {mode.name}
          </span>
        </div>

        <span
          className="ml-2 hidden shrink-0 items-center gap-1 font-mono text-xs text-muted-foreground sm:inline-flex"
          title={`Maximum ${mode.max_players_per_match} players per match`}
          aria-label={`${mode.max_players_per_match} max players`}
        >
          <Users
            className="size-3 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span>{mode.max_players_per_match}</span>
        </span>
      </button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete mode ${mode.name}`}
        title={`Delete mode ${mode.name}`}
        disabled={isDeletePending}
        onClick={() => onRequestDeleteMode(mode)}
        className="absolute right-1 top-1/2 -translate-y-1/2 text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:text-destructive focus-visible:ring-destructive/30"
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </motion.div>
  );
}

function GameModesAddButton({ onClick }: { onClick: () => void }) {
  return (
    <MotionConfig reducedMotion="user">
      <RippleButton
        type="button"
        variant="default"
        size="sm"
        onClick={onClick}
        className="h-8 gap-1.5 text-xs"
        hoverScale={1.015}
        tapScale={0.98}
      >
        <Plus aria-hidden="true" data-icon="inline-start" />
        Add Mode
        <RippleButtonRipples />
      </RippleButton>
    </MotionConfig>
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

export function GameModesLoadingState() {
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

export function GameModesEmptyState({
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

export function GameModesErrorState({
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

export function GameModesDesktopLayout({
  modes,
  selectedMode,
  selectedModeId,
  prefersReducedMotion,
  details,
  onSelectMode,
  onAddMode,
  onRequestDeleteMode,
  isDeletePending,
}: {
  modes: GameMode[];
  selectedMode: GameMode | null;
  selectedModeId: string | null;
  prefersReducedMotion: boolean;
  details: ModeDetailsPresentation;
  onSelectMode: (id: string) => void;
  onAddMode: () => void;
  onRequestDeleteMode: (mode: GameMode) => void;
  isDeletePending: boolean;
}) {
  return (
    <div className="hidden lg:grid lg:grid-cols-12 lg:items-start lg:gap-6 xl:gap-8">
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

          <GameModesAddButton onClick={onAddMode} />
        </div>

        <ul role="list" className="grid gap-2" aria-label="Desktop game modes list">
          {modes.map((mode) => (
            <li key={mode.id}>
              <GameModeListItem
                mode={mode}
                isSelected={mode.id === selectedModeId}
                onSelect={() => onSelectMode(mode.id)}
                onRequestDeleteMode={onRequestDeleteMode}
                isDeletePending={isDeletePending}
                prefersReducedMotion={prefersReducedMotion}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className="col-span-7 xl:col-span-8 min-w-0">
        {selectedMode ? (
          <SelectedModePanel
            mode={selectedMode}
            onRequestDeleteMode={onRequestDeleteMode}
            isDeletePending={isDeletePending}
            configs={details.configs}
            isConfigsLoading={details.isConfigsLoading}
            isConfigsError={details.isConfigsError}
            configsError={details.configsError}
            refetchConfigs={details.refetchConfigs}
          />
        ) : (
          <SelectedModeSkeleton />
        )}
      </div>
    </div>
  );
}

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

export function GameModesMobileLayout({
  modes,
  selectedMode,
  listSelectedModeId,
  mobileView,
  prefersReducedMotion,
  details,
  onSelectMode,
  onBackToList,
  onAddMode,
  onRequestDeleteMode,
  isDeletePending,
}: {
  modes: GameMode[];
  selectedMode: GameMode | null;
  listSelectedModeId: string | null;
  mobileView: "list" | "details";
  prefersReducedMotion: boolean;
  details: ModeDetailsPresentation;
  onSelectMode: (id: string) => void;
  onBackToList: () => void;
  onAddMode: () => void;
  onRequestDeleteMode: (mode: GameMode) => void;
  isDeletePending: boolean;
}) {
  return (
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
              onRequestDeleteMode={onRequestDeleteMode}
              isDeletePending={isDeletePending}
              configs={details.configs}
              isConfigsLoading={details.isConfigsLoading}
              isConfigsError={details.isConfigsError}
              configsError={details.configsError}
              refetchConfigs={details.refetchConfigs}
              backButton={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={onBackToList}
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
              selectedModeId={listSelectedModeId}
              onSelectMode={onSelectMode}
              onAddMode={onAddMode}
              onRequestDeleteMode={onRequestDeleteMode}
              isDeletePending={isDeletePending}
              prefersReducedMotion={prefersReducedMotion}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CompactModeListMobile({
  modes,
  selectedModeId,
  onSelectMode,
  onAddMode,
  onRequestDeleteMode,
  isDeletePending,
  prefersReducedMotion,
}: {
  modes: GameMode[];
  selectedModeId: string | null;
  onSelectMode: (id: string) => void;
  onAddMode: () => void;
  onRequestDeleteMode: (mode: GameMode) => void;
  isDeletePending: boolean;
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

        <GameModesAddButton onClick={onAddMode} />
      </div>

      <ul role="list" className="grid gap-2" aria-label="Game modes list">
        {modes.map((mode) => (
          <li key={mode.id}>
            <GameModeListItem
              mode={mode}
              isSelected={mode.id === selectedModeId}
              onSelect={() => onSelectMode(mode.id)}
              onRequestDeleteMode={onRequestDeleteMode}
              isDeletePending={isDeletePending}
              prefersReducedMotion={prefersReducedMotion}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
