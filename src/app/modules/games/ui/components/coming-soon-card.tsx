"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Game } from "@/lib/db/schema";

type ComingSoonCardProps = {
  game: Game;
};

export function ComingSoonCard({ game }: ComingSoonCardProps) {
  const hasBanner = Boolean(game.banner_url);

  return (
    <article
      className={cn(
        "group relative flex w-[calc(100vw-2rem)] max-w-[320px] shrink-0 flex-col overflow-hidden border border-border bg-card transition-colors hover:border-border-strong",
        "sm:w-[360px] lg:w-[400px]"
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {hasBanner ? (
          <Image
            src={game.banner_url as string}
            alt={`${game.name} banner`}
            fill
            sizes="(max-width: 768px) 80vw, (max-width: 1200px) 360px, 400px"
            className="scale-[1.08] object-cover blur-[4px] transition-transform duration-500 ease-out group-hover:scale-[1.12]"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-black/20" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 text-center">
          <p className="font-display text-2xl font-black leading-[0.9] text-white drop-shadow-sm sm:text-3xl">
            <span className="block">COMING</span>
            <span className="block">SOON</span>
          </p>
        </div>

      </div>
    </article>
  );
}