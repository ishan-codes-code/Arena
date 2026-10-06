"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Game } from "../../queries/games";
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
  const [showRightFade, setShowRightFade] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateFades = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const { scrollLeft, scrollWidth, clientWidth } = element;
    const hasOverflow = scrollWidth > clientWidth + 4;
    setShowLeftFade(hasOverflow && scrollLeft > 4);
    setShowRightFade(
      hasOverflow && scrollLeft + clientWidth < scrollWidth - 4
    );
  }, []);

  useEffect(() => {
    updateFades();
    window.addEventListener("resize", updateFades);

    return () => window.removeEventListener("resize", updateFades);
  }, [games.length, updateFades]);

  if (games.length === 0) return null;

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
      <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
        <h2 className="font-display text-2xl font-black tracking-[-0.05em] sm:text-3xl">
          {title}
        </h2>
        {href && (
          <a
            href={href}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-sm font-body text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            View all
          </a>
        )}
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={updateFades}
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
          disabled={!showLeftFade}
          className="absolute left-2 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-0"
          onClick={scrollLeft}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Scroll ${title} right`}
          disabled={!showRightFade}
          className="absolute right-2 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-0"
          onClick={scrollRight}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}