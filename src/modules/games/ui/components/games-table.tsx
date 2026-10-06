"use client";

import * as React from "react";
import {
  flexRender,
  type ColumnDef,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import Image from "next/image";
import { Calendar, Gamepad2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useGamesQuery, type Game } from "@/modules/games/queries/games";
import {
  GameFeaturedCheckbox,
  GameStatusSelect,
} from "./game-inline-controls";
import { GameRowActions } from "./game-row-actions";

const features = tableFeatures({});
type Features = typeof features;

const columns: ColumnDef<Features, Game>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Game",
    cell: ({ row }) => {
      const game = row.original;

      return (
        <div className="flex items-center gap-3">
          {game.icon_url ? (
            <Image
              src={game.icon_url}
              alt=""
              width={32}
              height={32}
              className="size-8 shrink-0 object-contain"
            />
          ) : (
            <div className="flex size-8 shrink-0 items-center justify-center rounded bg-muted">
              <Gamepad2 aria-hidden="true" className="size-4 text-muted-foreground" />
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
    cell: ({ row }) => <GameStatusSelect game={row.original} />,
  },
  {
    id: "is_featured",
    accessorKey: "is_featured",
    header: "Featured",
    cell: ({ row }) => <GameFeaturedCheckbox game={row.original} />,
  },
  {
    id: "updated_at",
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }) => {
      const updatedAt = new Date(row.original.updated_at);

      return (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar aria-hidden="true" className="size-3.5 shrink-0" />
          {updatedAt.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <GameRowActions game={row.original} />
      </div>
    ),
  },
];

export function GamesTable() {
  const { data, error, isError, isLoading } = useGamesQuery();
  const games = data?.games ?? [];

  const table = useTable({
    features,
    columns,
    data: games,
  });

  if (isError) {
    return (
      <div role="alert" className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="font-display text-2xl font-black tracking-[-0.06em]">
          Something went wrong
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message ?? "Unknown error"}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Table aria-label="Games" aria-busy="true">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }, (_, rowIndex) => (
            <TableRow key={`skeleton-${rowIndex}`} aria-hidden="true">
              {columns.map((column) => (
                <TableCell key={column.id}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (games.length === 0) {
    return (
      <div role="status" className="border-y border-border py-10 text-center">
        <p className="font-medium">No games yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          There are no games available in Arena.
        </p>
      </div>
    );
  }

  return (
    <Table aria-label="Games">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getAllCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
