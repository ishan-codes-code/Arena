"use client";

import { type ReactNode } from "react";
import { Gamepad2 } from "lucide-react";

import { useGamesQuery } from "@/modules/games/queries/games";
import { FeaturedCarousel } from "../components/featured-carousel";
import { GameRail } from "../components/game-rail";
import { ComingSoonCarousel } from "../components/coming-soon-carousel";
import { Skeleton } from "@/components/ui/skeleton";

function GamesError({ message }: { message: string }): ReactNode {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10">
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="font-display text-2xl font-black tracking-[-0.06em]">
          Something went wrong
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function GamesSkeleton(): ReactNode {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
      <div className="flex flex-col gap-14 sm:gap-16">
        <div>
          <Skeleton className="mb-6 h-4 w-24" />
          <Skeleton className="aspect-[16/9] w-full rounded-lg" />
        </div>
        <section>
          <Skeleton className="mb-5 h-8 w-48 sm:mb-6" />
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="w-[260px] shrink-0 sm:w-[280px]">
                <Skeleton className="aspect-[16/10] w-full rounded-lg" />
                <Skeleton className="mt-3 h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            ))}
          </div>
        </section>
        <section>
          <Skeleton className="mb-5 h-8 w-48 sm:mb-6" />
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="w-[260px] shrink-0 sm:w-[280px]">
                <Skeleton className="aspect-[16/10] w-full rounded-lg" />
                <Skeleton className="mt-3 h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function GamesView() {
  const {
    data,
    error,
    isLoading,
    isError,
  } = useGamesQuery();

  if (isError && !data) return GamesError({ message: error?.message ?? "Unknown error" });
  if (isLoading || !data) return GamesSkeleton();

  const games = data.games;
  const featuredGames = games.filter((g) => g.is_featured);
  const activeGames = games.filter((g) => g.status === "active");
  const comingSoonGames = games.filter((g) => g.status === "coming_soon");

  const hasFeatured = featuredGames.length > 0;
  const hasComingSoon = comingSoonGames.length > 0;
  const hasActive = activeGames.length > 0;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {hasFeatured && (
        <section aria-label="Featured games" className="relative w-full">
          <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 lg:px-10">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Featured
            </span>
          </div>
          <div className="relative aspect-[16/9] w-full">
            <FeaturedCarousel games={featuredGames} />
          </div>
        </section>
      )}

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
        <div className="flex flex-col gap-14 sm:gap-16">
          {hasActive && (
            <GameRail title="ALL GAMES" games={activeGames} href="/games" />
          )}

          {hasComingSoon && (
            <section aria-labelledby="coming-soon-heading">
              <h2
                id="coming-soon-heading"
                className="mb-5 font-display text-2xl font-black tracking-[-0.05em] sm:mb-6 sm:text-3xl"
              >
                COMING SOON
              </h2>
              <ComingSoonCarousel games={comingSoonGames} />
            </section>
          )}

          {!hasFeatured && !hasActive && !hasComingSoon && (
            <section className="py-16 text-center">
              <Gamepad2 className="mx-auto size-12 text-muted-foreground" />
              <p className="mt-4 font-display text-2xl font-black tracking-[-0.06em]">
                No games yet
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Check back soon — new titles are arriving.
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}