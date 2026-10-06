"use client";

import { LoaderCircle } from "lucide-react";

import {
  Checkbox,
  CheckboxIndicator,
} from "@/components/animate-ui/primitives/radix/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GAME_STATUSES } from "@/modules/games/schemas";
import type { Game } from "@/modules/games/queries/games";
import { cn } from "@/lib/utils";
import { useGameUpdateMutation } from "./game-update-mutation";

const statusStyles = {
  active: "bg-live/10 text-live",
  coming_soon: "bg-pending/10 text-pending",
  inactive: "bg-structural/10 text-structural",
  archived: "bg-ink/10 text-ink",
} satisfies Record<Game["status"], string>;

export function GameStatusSelect({ game }: { game: Game }) {
  const updateMutation = useGameUpdateMutation();

  return (
    <Select
      value={game.status}
      onValueChange={(value) => {
        const nextStatus = GAME_STATUSES.find(
          (status) => status.value === value,
        )?.value;
        if (
          !nextStatus ||
          nextStatus === game.status ||
          updateMutation.isPending
        ) {
          return;
        }

        updateMutation.mutate({ id: game.id, status: nextStatus });
      }}
    >
      <SelectTrigger
        aria-label={`Status for ${game.name}`}
        aria-busy={updateMutation.isPending}
        disabled={updateMutation.isPending}
        className={cn(
          "h-7 min-w-0 gap-1 rounded-full border-transparent px-2 py-0 text-xs font-medium",
          statusStyles[game.status],
          updateMutation.isPending && "opacity-60",
        )}
      >
        {updateMutation.isPending ? (
          <LoaderCircle
            aria-hidden="true"
            className="size-3 animate-spin"
          />
        ) : (
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-current"
          />
        )}
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectGroup>
          {GAME_STATUSES.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function GameFeaturedCheckbox({ game }: { game: Game }) {
  const updateMutation = useGameUpdateMutation();

  return (
    <Checkbox
      aria-label={`Featured game: ${game.name}`}
      checked={game.is_featured}
      disabled={updateMutation.isPending}
      aria-busy={updateMutation.isPending}
      onCheckedChange={(checked) => {
        if (typeof checked !== "boolean" || updateMutation.isPending) return;
        updateMutation.mutate({ id: game.id, is_featured: checked });
      }}
      className={cn(
        "flex size-6 items-center justify-center rounded border border-input bg-background text-primary-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary",
        updateMutation.isPending && "opacity-60",
      )}
    >
      <CheckboxIndicator className="size-3" />
    </Checkbox>
  );
}
