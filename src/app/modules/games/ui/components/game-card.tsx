import Image from "next/image";

import type { Game } from "@/lib/db/schema";

type GameCardProps = {
  game: Game;
};

export function GameCard({ game }: GameCardProps) {
  const hasImage = Boolean(game.banner_url);

  return (
    <article className="group relative flex w-[260px] shrink-0 flex-col overflow-hidden border border-border bg-card transition-colors hover:border-border-strong sm:w-[280px]">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {hasImage ? (
          <Image
            src={game.banner_url as string}
            alt={`${game.name} banner`}
            fill
            sizes="(max-width: 768px) 80vw, (max-width: 1200px) 280px, 280px"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center border-b border-border bg-card">
            <span className="font-display text-5xl font-black tracking-[-0.07em] text-muted-foreground/20">
              {game.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {game.status === "coming_soon" && (
          <span className="absolute left-3 top-3 border border-border-strong bg-black/60 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            Coming Soon
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-tight tracking-[-0.03em]">
            {game.short_name ?? game.name}
          </h3>
          {game.logo_url && (
            <span className="relative mt-0.5 size-7 shrink-0 overflow-hidden rounded-sm bg-muted">
              <Image
                src={game.logo_url}
                alt=""
                fill
                sizes="28px"
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