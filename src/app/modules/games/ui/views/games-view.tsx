"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Gamepad2 } from "lucide-react";

import type { Game } from "@/lib/db/schema";
import { FeaturedCarousel } from "../components/featured-carousel";
import { GameRail } from "../components/game-rail";

type GamesResponse = { games: Game[] };

function GamesError({ message }: { message: string }): ReactNode {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10">
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="font-display text-2xl font-black tracking-[-0.06em]">Something went wrong</p>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function GamesSkeleton(): ReactNode {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10">
      <div className="mb-10 h-48 rounded-lg bg-muted animate-pulse" />
      <div className="mb-6 h-8 w-48 rounded bg-muted animate-pulse" />
      <div className="mb-12 flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 w-64 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
      <div className="mb-6 h-8 w-48 rounded bg-muted animate-pulse" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 w-64 rounded-lg bg-muted animate-pulse" />
        ))}
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
  if (!data) return GamesSkeleton();

  const games = data.games;
  const featuredGames = games.filter((g) => g.is_featured);
  const activeGames = games.filter((g) => g.status === "active");
  const comingSoonGames = games.filter((g) => g.status === "coming_soon");

  return (
    <main className="min-h-screen bg-background text-foreground">
      {featuredGames.length > 0 && (
        <section aria-label="Featured games" className="border-b border-border">
          <FeaturedCarousel games={featuredGames} />
        </section>
      )}

      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10">
        <GameRail title="ALL GAMES" games={activeGames} href="/games" />

        {comingSoonGames.length > 0 && (
          <section className="mt-16">
            <GameRail title="COMING SOON" games={comingSoonGames} />
          </section>
        )}

        {activeGames.length === 0 && comingSoonGames.length === 0 && (
          <section className="py-16 text-center">
            <Gamepad2 className="mx-auto size-12 text-muted-foreground" />
            <p className="mt-4 font-display text-2xl font-black tracking-[-0.06em]">No games yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Check back soon — new titles are arriving.</p>
          </section>
        )}
      </div>
    </main>
  );
}