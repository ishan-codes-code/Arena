"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ArrowLeft,
  Gamepad2,
  ExternalLink,
  Sparkles,
  Trophy,
  Sliders,
} from "lucide-react";
import { useGamesQuery } from "@/modules/games/queries/games";
import { GAME_STATUSES } from "@/modules/games/schemas";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
} from "@/components/animate-ui/components/animate/tabs";
import { GameOverviewTab } from "../components/game-overview-tab";
import { GameModesTab } from "../components/game-modes-tab";
import { cn } from "@/lib/utils";

type GameDetailsViewProps = {
  slug: string;
};

function GameDetailsSkeleton() {
  return (
    <main className="flex-1 bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pt-10">
        {/* Breadcrumb skeleton */}
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="size-3" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="size-3" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Header skeleton */}
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-64 sm:w-80" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="mt-6 space-y-6">
          <Skeleton className="h-10 w-80 rounded-lg" />
          <div className="grid gap-6 sm:grid-cols-2">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg sm:col-span-2" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function GameDetailsView({ slug }: GameDetailsViewProps) {
  const { data, isLoading, isError, error } = useGamesQuery();
  const games = data?.games ?? [];
  const game = games.find((g) => g.slug === slug);

  if (isLoading) {
    return <GameDetailsSkeleton />;
  }

  if (isError) {
    return (
      <main className="flex-1 bg-background text-foreground">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10">
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h2 className="font-display text-2xl font-black tracking-[-0.05em]">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {error?.message ?? "Failed to load game details."}
            </p>
            <div className="mt-6">
              <Link
                href="/console/games"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <ArrowLeft className="mr-2 size-4" />
                Back to Games
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="flex-1 bg-background text-foreground">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10">
          <div className="rounded-lg border border-border bg-card p-10 text-center">
            <Gamepad2 className="mx-auto size-12 text-muted-foreground/40" />
            <h2 className="mt-4 font-display text-2xl font-black tracking-[-0.05em]">
              Game not found
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The game &ldquo;{slug}&rdquo; could not be found in Arena&apos;s catalog.
            </p>
            <div className="mt-6">
              <Link
                href="/console/games"
                className={cn(buttonVariants({ variant: "default" }))}
              >
                <ArrowLeft className="mr-2 size-4" />
                Back to Games catalog
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const currentStatus =
    GAME_STATUSES.find((s) => s.value === game.status)?.label ?? game.status;

  return (
    <main className="flex-1 bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pt-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 sm:mb-5">
          <ol className="flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground">
            <li>
              <Link
                href="/console/games"
                className="transition-colors hover:text-foreground"
              >
                Console
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3" />
            </li>
            <li>
              <Link
                href="/console/games"
                className="transition-colors hover:text-foreground"
              >
                Games
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3" />
            </li>
            <li aria-current="page" className="truncate font-semibold text-foreground">
              {game.name}
            </li>
          </ol>
        </nav>

        {/* Back Link */}
        <div className="mb-3">
          <Link
            href="/console/games"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-2.5 h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground",
            )}
          >
            <ArrowLeft className="size-3.5" />
            All Games
          </Link>
        </div>

        {/* Game Header */}
        <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4 sm:gap-5">
            {game.icon_url ? (
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-card shadow-xs sm:size-20">
                <Image
                  src={game.icon_url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </div>
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 text-muted-foreground sm:size-20">
                <Gamepad2 className="size-8" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl font-black leading-tight tracking-[-0.05em] sm:text-3xl lg:text-4xl">
                  {game.name}
                </h1>
                {game.is_featured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
                    <Sparkles className="size-3" />
                    Featured
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                {/* Status indicator */}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-2 py-0.5 text-xs font-medium">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-1.5 rounded-full shrink-0",
                      game.status === "active" && "bg-live",
                      game.status === "coming_soon" && "bg-pending",
                      game.status === "inactive" && "bg-structural",
                      game.status === "archived" && "bg-ink",
                    )}
                  />
                  <span>{currentStatus}</span>
                </span>

                {game.short_name && (
                  <span className="font-mono text-xs text-foreground/80">
                    [{game.short_name}]
                  </span>
                )}

                <span className="font-mono text-xs text-muted-foreground">
                  slug: {game.slug}
                </span>

                {(game.developer || game.publisher) && (
                  <span className="text-muted-foreground">
                    by {game.developer || game.publisher}
                  </span>
                )}

                <Link
                  href={`/tournaments/${game.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline"
                >
                  View public
                  <ExternalLink className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Primary Animated Navigation Tabs */}
        <section aria-label="Game sections" className="mt-6 sm:mt-8">
          <Tabs defaultValue="overview">
            <TabsList className="h-10 w-full justify-start overflow-x-auto sm:w-fit">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="modes">Modes</TabsTrigger>
              <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContents className="mt-8">
              {/* Tab 1: Overview */}
              <TabsContent value="overview">
                <GameOverviewTab game={game} />
              </TabsContent>

              {/* Tab 2: Modes */}
              <TabsContent value="modes">
                <GameModesTab game={game} />
              </TabsContent>

              {/* Tab 3: Tournaments (Minimal placeholder) */}
              <TabsContent value="tournaments">
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/10 p-12 text-center sm:p-16">
                  <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-card">
                    <Trophy className="size-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.03em]">
                    Tournaments
                  </h3>
                  <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                    Manage active and scheduled tournaments, prize pools, and brackets for {game.name}.
                  </p>
                  <span className="mt-4 inline-block font-mono text-[11px] uppercase tracking-wider text-muted-foreground/75">
                    Planned feature • Ready for implementation
                  </span>
                </div>
              </TabsContent>

              {/* Tab 4: Settings (Minimal placeholder) */}
              <TabsContent value="settings">
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/10 p-12 text-center sm:p-16">
                  <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-card">
                    <Sliders className="size-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.03em]">
                    Settings
                  </h3>
                  <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                    Advanced integrations, webhook configurations, and game-specific technical settings.
                  </p>
                  <span className="mt-4 inline-block font-mono text-[11px] uppercase tracking-wider text-muted-foreground/75">
                    Planned feature • Ready for implementation
                  </span>
                </div>
              </TabsContent>
            </TabsContents>
          </Tabs>
        </section>
      </div>
    </main>
  );
}
