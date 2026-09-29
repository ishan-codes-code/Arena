"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Gamepad2 } from "lucide-react";

import type { Game } from "@/lib/db/schema";
import { FeaturedCarousel } from "../components/featured-carousel";
import { GameRail } from "../components/game-rail";
import { ComingSoonCarousel } from "../components/coming-soon-carousel";
import Loader from "@/components/kokonutui/loader";

type GamesResponse = { games: Game[] };

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

export function GamesView() {
  const [data, setData] = useState<GamesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/games")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch games.");
        return res.json();
      })
      .then((json: GamesResponse) => setData(json))
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) return GamesError({ message: error });
  if (!data) return <Loader />;

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
          <div className="relative w-full aspect-[16/9]">
            <FeaturedCarousel games={featuredGames} />
          </div>
        </section>
      )}

      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10">
        {hasActive && <GameRail title="ALL GAMES" games={activeGames} href="/games" />}

        {hasComingSoon && (
          <section className="mt-16">
            <h2 className="font-display text-3xl font-black tracking-[-0.06em] sm:text-4xl mb-6">
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
    </main>
  );
}