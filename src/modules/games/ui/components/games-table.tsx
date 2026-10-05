"use client";

import * as React from "react";
import {
  useTable,
  flexRender,
  ColumnDef,
  tableFeatures,
  coreColumnsFeature,
  coreHeadersFeature,
  coreCellsFeature,
  coreRowsFeature,
  coreRowModelsFeature,
} from "@tanstack/react-table";
import { Gamepad2, Calendar } from "lucide-react";
import { useGamesQuery } from "@/modules/games/queries/games";
import { GameRowActions } from "./game-row-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Game } from "@/modules/games/queries/games";
import { cn } from "@/lib/utils";

const features = tableFeatures({
  coreColumnsFeature,
  coreHeadersFeature,
  coreCellsFeature,
  coreRowsFeature,
  coreRowModelsFeature,
});

type Features = typeof features;
type Data = Game;

export function GamesTable() {
  const {
    data,
    error,
    isLoading,
    isError,
  } = useGamesQuery();

  const games = data?.games ?? [];

  const columns = React.useMemo<ColumnDef<Features, Data>[]>(() => [
    {
      id: "name",
      accessorKey: "name",
      header: "Game",
      cell: ({ row }) => {
        const game = row.original;
        return (
          <div className="flex items-center gap-3">
            {game.icon_url ? (
              <img
                src={game.icon_url}
                alt={game.name}
                className="h-8 w-8 object-contain flex-shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                <Gamepad2 className="size-4 text-muted-foreground" />
              </div>
            )}
            <div>
              <div className="font-medium">{game.name}</div>
              {game.short_name && (
                <div className="text-xs text-muted-foreground">{game.short_name}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const statusMap: Record<string, { label: string; colorKey: string }> = {
          active: { label: "Active", colorKey: "live" },
          coming_soon: { label: "Coming Soon", colorKey: "pending" },
          inactive: { label: "Inactive", colorKey: "structural" },
          archived: { label: "Archived", colorKey: "ink" },
        };
        const { label, colorKey } = statusMap[status] || {
          label: status,
          colorKey: "structural",
        };
        return (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              `bg-${colorKey}/10 text-${colorKey}`
            )}
          >
            <span className="block h-1.5 w-1.5 rounded-full bg-current me-1.5" />
            {label}
          </span>
        );
      },
    },
    {
      id: "is_featured",
      accessorKey: "is_featured",
      header: "Featured",
      cell: ({ row }) => {
        const isFeatured = row.original.is_featured;
        return (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              isFeatured
                ? "bg-live/10 text-live"
                : "bg-ink/10 text-ink"
            )}
          >
            {isFeatured ? "Yes" : "No"}
          </span>
        );
      },
    },
    {
      id: "updated_at",
      accessorKey: "updated_at",
      header: "Updated",
      cell: ({ row }) => {
        const updatedAt = new Date(row.original.updated_at);
        return (
          <div className="text-sm text-muted-foreground">
            <Calendar className="size-3.5 me-1" />
            {updatedAt.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const game = row.original;
        return (
          <div className="flex items-center justify-end space-x-2">
            <GameRowActions />
          </div>
        );
      },
    },
  ], []);

  const table = useTable({
    data: games,
    columns,
    features,
  });

  if (isError && !data) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="font-display text-2xl font-black tracking-[-0.06em]">
            Something went wrong
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error?.message ?? "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !data || games.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="relative w-full overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b">
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap"
                  >
                    {flexRender(column.header as React.ReactNode, {})}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b">
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className="p-2 align-middle whitespace-nowrap"
                    >
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4">
      <div className="relative w-full overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0"
                  >
                    {flexRender(header.column.columnDef.header as React.ReactNode, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                {row.getAllCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0"
                  >
                    {flexRender(cell.column.columnDef.cell as React.ReactNode, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}