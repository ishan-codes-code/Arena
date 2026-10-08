"use client";

import * as React from "react";
import {
  AlertCircle,
  Layers,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useModeTeamConfigsQuery,
  type GameMode,
  type ModeTeamConfiguration,
} from "@/modules/games/queries/modes";

type ModeTeamConfigurationsProps = {
  mode: GameMode;
};

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function TeamConfigsSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border/70 bg-card/60"
      aria-busy="true"
      aria-label="Loading team configurations"
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Team Size</TableHead>
            <TableHead className="hidden sm:table-cell">Created</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 3 }).map((_, index) => (
            <TableRow key={`config-skeleton-${index}`} className="border-border/40">
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-4 w-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28 sm:w-36" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-md" />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Skeleton className="size-7 rounded-md" />
                  <Skeleton className="size-7 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TeamConfigsEmptyState({ modeName }: { modeName: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/10 p-8 text-center sm:p-10"
    >
      <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-card shadow-xs">
        <Layers className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <h5 className="mt-3 font-display text-base font-bold tracking-[-0.02em] text-foreground">
        No team configurations yet
      </h5>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
        Configurations define the team sizes available for {modeName} (e.g. Solo, Duo, Squad).
      </p>
    </div>
  );
}

function TeamConfigsErrorState({
  errorMessage,
  onRetry,
}: {
  errorMessage?: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center"
    >
      <div className="flex size-9 items-center justify-center rounded-lg border border-destructive/30 bg-background text-destructive shadow-xs">
        <AlertCircle className="size-4.5" aria-hidden="true" />
      </div>
      <h5 className="mt-2.5 font-display text-sm font-bold tracking-[-0.02em] text-foreground">
        Unable to load team configurations
      </h5>
      <p className="mt-0.5 max-w-sm text-xs text-muted-foreground">
        {errorMessage || "There was a problem fetching configurations for this mode."}
      </p>
      <div className="mt-3.5">
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={onRetry}
          className="h-7 gap-1.5 text-xs"
        >
          <RotateCcw className="size-3" aria-hidden="true" />
          Retry
        </Button>
      </div>
    </div>
  );
}

function ConfigRow({
  config,
  index,
}: {
  config: ModeTeamConfiguration;
  index: number;
}) {
  return (
    <TableRow className="border-border/50 transition-colors hover:bg-muted/30">
      <TableCell className="text-center font-mono text-xs text-muted-foreground">
        {index + 1}
      </TableCell>
      <TableCell>
        <div className="font-medium text-foreground">{config.name}</div>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-xs text-foreground/90">
          <Users className="size-3 text-muted-foreground" aria-hidden="true" />
          <span>
            {config.team_size} {config.team_size === 1 ? "player" : "players"}
          </span>
        </span>
      </TableCell>
      <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
        {formatDate(config.created_at)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled
            className="size-7 text-muted-foreground"
            title="Edit configuration (coming soon)"
            aria-label={`Edit ${config.name}`}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled
            className="size-7 text-muted-foreground hover:text-destructive"
            title="Delete configuration (coming soon)"
            aria-label={`Delete ${config.name}`}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ModeTeamConfigurations({ mode }: ModeTeamConfigurationsProps) {
  const { data, isLoading, isError, error, refetch } = useModeTeamConfigsQuery(mode.id);
  const configurations = data?.configurations ?? [];

  return (
    <div className="space-y-4 pt-2">
      {/* Section Header */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground sm:text-base">
              Team Configurations
            </h4>
            {!isLoading && !isError && (
              <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/60 px-2 py-0.2 font-mono text-[10px] font-medium text-muted-foreground">
                {configurations.length}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Define the team sizes available for this mode.
          </p>
        </div>

        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            className="h-8 gap-1.5 text-xs text-muted-foreground"
            title="Add Configuration modal will be available in an upcoming update"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add Configuration
          </Button>
        </div>
      </div>

      {/* Content States */}
      <div>
        {isLoading && <TeamConfigsSkeleton />}

        {isError && (
          <TeamConfigsErrorState
            errorMessage={error?.message}
            onRetry={() => void refetch()}
          />
        )}

        {!isLoading && !isError && configurations.length === 0 && (
          <TeamConfigsEmptyState modeName={mode.name} />
        )}

        {!isLoading && !isError && configurations.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-border/70 bg-card/60 shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Team Size</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configurations.map((config, index) => (
                  <ConfigRow
                    key={config.id}
                    config={config}
                    index={index}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
