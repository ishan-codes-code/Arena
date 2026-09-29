"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Game } from "@/lib/db/schema";
import ShimmerText from "@/components/kokonutui/shimmer-text";

type ComingSoonCardProps = {
  game: Game;
};

export function ComingSoonCard({ game }: ComingSoonCardProps) {
  const hasBanner = Boolean(game.banner_url);

  return (
    <article
      className={cn(
        "group relative flex w-[320px] shrink-0 overflow-hidden border border-border bg-card transition-colors hover:border-border-strong",
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
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted">
            <span className="font-display text-4xl font-black tracking-[-0.05em] text-muted-foreground/25">
              {game.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <div className="absolute inset-0 flex items-center justify-center p-6">
          <ShimmerText
            text="COMING SOON"
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.04em]"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold leading-tight tracking-[-0.03em]">
            {game.short_name ?? game.name}
          </h3>
          {game.logo_url && (
            <span className="relative mt-0.5 size-8 shrink-0 overflow-hidden rounded-sm bg-muted">
              <Image
                src={game.logo_url}
                alt=""
                fill
                sizes="32px"
                className="object-cover"
              />
            </span>
          )}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {game.developer ?? game.publisher ?? "Arena"}
        </p>
      </div>
    </article>
  );
}