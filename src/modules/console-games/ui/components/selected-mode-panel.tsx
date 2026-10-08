"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  Pencil,
  Sliders,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useModeTeamConfigsQuery,
  type GameMode,
} from "@/modules/games/queries/modes";
import { ModeTeamConfigurations } from "./mode-team-configurations";

type SelectedModePanelProps = {
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

function ModeSummaryCard({
  icon: Icon,
  label,
  value,
  isLoading,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  label: string;
  value: React.ReactNode;
  isLoading?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between gap-2 rounded-lg border border-border/70 bg-card/60 p-3.5 sm:p-4 transition-colors hover:border-border">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="font-mono text-[10px] uppercase tracking-wider">
          {label}
        </span>
        <Icon className="size-3.5 text-muted-foreground/70" aria-hidden="true" />
      </div>
      <div className="font-mono text-lg font-bold tracking-tight text-foreground sm:text-xl">
        {isLoading ? <Skeleton className="h-6 w-12" /> : value}
      </div>
    </div>
  );
}

export function SelectedModePanel({ mode }: SelectedModePanelProps) {
  const { data: configsData, isLoading: isConfigsLoading } = useModeTeamConfigsQuery(mode.id);
  const configsCount = configsData?.configurations.length ?? 0;

  return (
    <div className="space-y-6 rounded-xl border border-border/70 bg-card/40 p-4 sm:p-6 shadow-xs">
      {/* Selected Mode Header */}
      <div className="flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-display text-xl font-black tracking-[-0.03em] text-foreground sm:text-2xl">
              {mode.name}
            </h3>
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

        <div className="shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            className="h-8 gap-1.5 text-xs text-muted-foreground"
            title="Edit Mode modal will be available in an upcoming update"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Edit Mode
          </Button>
        </div>
      </div>

      {/* Mode Summary Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <ModeSummaryCard
          icon={Users}
          label="Max Players"
          value={`${mode.max_players_per_match}`}
        />
        <ModeSummaryCard
          icon={Sliders}
          label="Configurations"
          value={configsCount}
          isLoading={isConfigsLoading}
        />
        <ModeSummaryCard
          icon={Calendar}
          label="Created"
          value={formatDate(mode.created_at)}
        />
        <ModeSummaryCard
          icon={Clock}
          label="Updated"
          value={formatDate(mode.updated_at)}
        />
      </div>

      {/* Team Configurations Section */}
      <ModeTeamConfigurations mode={mode} />
    </div>
  );
}
