"use client";

import { type KeyboardEvent, useEffect, useState } from "react";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";

import type { Game } from "@/lib/db/schema";
import { useIsMobile } from "@/hooks/use-mobile";

type FeaturedCarouselProps = {
  games: Game[];
};

export function FeaturedCarousel({ games }: FeaturedCarouselProps) {
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile();
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  useEffect(() => {
    if (games.length === 0) return;
    // Async state update to avoid lint warning
    const timer = setTimeout(() => {
      setActive((prev) => (prev >= games.length ? 0 : prev));
    }, 0);
    return () => clearTimeout(timer);
  }, [games.length]);

  if (games.length === 0) return null;

  const slideCount = games.length;

  const goNext = () => setActive((prev) => (prev + 1) % slideCount);
  const goPrev = () => setActive((prev) => (prev - 1 + slideCount) % slideCount);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") goNext();
    if (event.key === "ArrowLeft") goPrev();
  };

  const slideWidth = isMobile ? 90 : 80;
  const offset = -(active * slideWidth);

  return (
    <section aria-label="Featured games" className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{
          transform: `translateX(${offset}%)`,
          transitionBehavior: prefersReducedMotion ? "normal" : undefined,
        }}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured games"
      >
        {games.map((game, index) => (
          <div
            key={game.id}
            className="min-w-full shrink-0 px-3 sm:px-6 lg:px-10"
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} of ${slideCount}: ${game.name}`}
          >
            <FeaturedSlide game={game} />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 grid size-10 place-items-center rounded-full border border-border-strong bg-black/50 text-foreground backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-ring"
        onClick={goPrev}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 grid size-10 place-items-center rounded-full border border-border-strong bg-black/50 text-foreground backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-ring"
        onClick={goNext}
      >
        ›
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {games.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            className={`h-1 rounded-full transition-all duration-300 ${index === active ? "w-6 bg-primary" : "w-1.5 bg-foreground/40"}`}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </section>
  );
}

function FeaturedSlide({ game }: { game: Game }) {
  const hasImage = Boolean(game.banner_url);

  return (
    <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg bg-slab sm:aspect-[16/7]">
      {hasImage ? (
        <Image
          src={game.banner_url as string}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-slab">
          <Gamepad2 className="size-16 text-muted-foreground/20" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-12">
        <div className="flex items-center gap-3">
          {game.logo_url && (
            <div className="relative size-14 overflow-hidden rounded-sm bg-black/40 p-2 sm:size-16">
              <Image src={game.logo_url} alt="" fill sizes="64px" className="object-contain" />
            </div>
          )}
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Featured · {game.status.replace("_", " ")}
          </span>
        </div>
        <h2 className="mt-4 max-w-3xl font-display text-4xl font-black leading-[0.9] tracking-[-0.07em] sm:text-6xl lg:text-[5.5rem]">
          {game.name}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg">
          {game.description ?? "Compete in free-entry tournaments on Arena."}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground sm:mt-8">
          {game.developer && (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
              Dev: {game.developer}
            </span>
          )}
          {game.publisher && (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
              Publisher: {game.publisher}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}