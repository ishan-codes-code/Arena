"use client";

import { useRef, useState } from "react";

import type { Game } from "@/lib/db/schema";
import { GameCard } from "./game-card";
import { useIsMobile } from "@/hooks/use-mobile";

type GameRailProps = {
  title: string;
  games: Game[];
  href?: string;
  ariaLabel?: string;
};

export function GameRail({ title, games, href, ariaLabel }: GameRailProps) {
  const isMobile = useIsMobile();
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (games.length === 0) return null;

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element) return;
    const { scrollLeft, scrollWidth, clientWidth } = element;
    setShowLeftFade(scrollLeft > 4);
    setShowRightFade(scrollLeft + clientWidth < scrollWidth - 4);
  };

  const scrollLeft = () => {
    const element = scrollRef.current;
    if (element) {
      const cardWidth = isMobile ? 260 : 280;
      element.scrollBy({ left: -cardWidth * 2 - 32, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const element = scrollRef.current;
    if (element) {
      const cardWidth = isMobile ? 260 : 280;
      element.scrollBy({ left: cardWidth * 2 + 32, behavior: "smooth" });
    }
  };

  return (
    <section className="relative" aria-label={ariaLabel ?? title}>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="font-display text-3xl font-black tracking-[-0.06em] sm:text-4xl">
          {title}
        </h2>
        {href && (
          <a
            href={href}
            className="inline-flex items-center gap-1.5 font-body text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          >
            View all
          </a>
        )}
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
          role="region"
          aria-label={`${title} carousel`}
          tabIndex={0}
        >
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {showLeftFade && (
          <div
            className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none"
            aria-hidden="true"
          />
        )}
        {showRightFade && (
          <div
            className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none"
            aria-hidden="true"
          />
        )}

        <button
          type="button"
          aria-label={`Scroll ${title} left`}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 grid size-10 place-items-center rounded-full border border-border-strong bg-background/80 text-foreground backdrop-blur-sm opacity-0 transition-opacity hover:bg-background hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring sm:opacity-100"
          onClick={scrollLeft}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label={`Scroll ${title} right`}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 grid size-10 place-items-center rounded-full border border-border-strong bg-background/80 text-foreground backdrop-blur-sm opacity-0 transition-opacity hover:bg-background hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring sm:opacity-100"
          onClick={scrollRight}
        >
          ›
        </button>
      </div>
    </section>
  );
}