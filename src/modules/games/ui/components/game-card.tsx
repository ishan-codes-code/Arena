import Image from "next/image";
import Link from "next/link";

import { GAME_STATUSES } from "../../schemas";
import type { Game } from "../../queries/games";
import { ExternalLink } from "@/components/animate-ui/icons/external-link";

type GameCardProps = {
  game: Game;
};

export function GameCard({ game }: GameCardProps) {
  const hasImage = Boolean(game.banner_url);

  return (
    <article className="group relative flex w-[260px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-border-strong sm:w-[280px]">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {hasImage ? (
          <Image
            src={game.banner_url as string}
            alt={`${game.name} banner`}
            fill
            sizes="(max-width: 639px) 260px, 280px"
            className="object-contain"
          />
        ) : (
          <div className="flex size-full items-center justify-center border-b border-border bg-card">
            <span className="font-display text-4xl font-black tracking-[-0.07em] text-muted-foreground/20">
              {game.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {game.status === "coming_soon" && (
          <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-black/70 px-2.5 py-1 font-mono text-xs font-medium uppercase tracking-[0.12em] text-white shadow-sm">
            {
              GAME_STATUSES.find(
                (status) => status.value === game.status,
              )?.label
            }
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/tournaments/${game.slug}`}
            className="inline-flex min-w-0 items-center gap-1.5 rounded-sm text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <h3 className="truncate font-display text-base font-bold leading-tight tracking-[-0.03em]">
              {game.short_name ?? game.name}
            </h3>
            <ExternalLink
              animateOnHover
              className="size-3.5 shrink-0 text-muted-foreground align-middle"
            />
          </Link>
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
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
          {game.developer ?? game.publisher ?? "Arena"}
        </p>
      </div>
    </article>
  );
}