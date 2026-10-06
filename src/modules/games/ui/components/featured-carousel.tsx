"use client";

import * as React from "react";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel";
import autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { ExternalLink } from "@/components/animate-ui/icons/external-link";

import type { Game } from "../../queries/games";
import { GAME_STATUSES } from "../../schemas";

type FeaturedCarouselProps = {
  games: Game[];
};

export function FeaturedCarousel({ games }: FeaturedCarouselProps) {
  const [plugin] = React.useState(() =>
    autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  if (games.length === 0) return null;

  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[plugin]}
      className="relative h-full w-full"
      onMouseEnter={plugin.stop}
      onMouseLeave={plugin.reset}
    >
      <CarouselContent className="h-full">
        {games.map((game) => (
          <CarouselItem key={game.id}>
            <FeaturedSlide game={game} />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious
        size="icon-lg"
        className="left-4 top-1/2 -translate-y-1/2 rounded-full border border-border-strong bg-black/50 text-foreground backdrop-blur-sm hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-ring hidden md:inline-flex"
      />
      <CarouselNext
        size="icon-lg"
        className="right-4 top-1/2 -translate-y-1/2 rounded-full border border-border-strong bg-black/50 text-foreground backdrop-blur-sm hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-ring hidden md:inline-flex"
      />

      <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 sm:bottom-2">
        <SlideIndicators games={games} />
      </div>
    </Carousel>
  );
}

function SlideIndicators({ games }: { games: Game[] }) {
  const { api } = useCarousel();
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const selected = api.selectedScrollSnap();
      setSelectedIndex(selected);
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <>
      {games.map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === selectedIndex ? "true" : undefined}
          className="inline-flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => api?.scrollTo(index)}
        >
          <span
            aria-hidden="true"
            className={cn(
              "h-1.5 rounded-full transition-[width,background-color] duration-300",
              index === selectedIndex
                ? "w-6 bg-primary"
                : "w-1.5 bg-foreground/60",
            )}
          />
        </button>
      ))}
    </>
  );
}

function FeaturedSlide({ game }: { game: Game }) {
  const hasImage = Boolean(game.banner_url);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slab">
      {hasImage ? (
        <Image
          src={game.banner_url as string}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-slab">
          <Gamepad2 className="size-20 text-muted-foreground/20" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 lg:p-12">
        <div className="flex items-center gap-2 sm:gap-3">
          {game.logo_url && (
            <div className="relative size-10 overflow-hidden rounded-sm bg-black/40 p-1.5 sm:size-14">
              <Image src={game.logo_url} alt="" fill sizes="56px" className="object-contain" />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-foreground/80">
              Featured
            </span>
            {game.status === "coming_soon" && (
              <span className="rounded-full border border-white/30 bg-black/70 px-2.5 py-1 font-mono text-xs font-medium uppercase tracking-[0.12em] text-white shadow-sm">
                {
                  GAME_STATUSES.find(
                    (status) => status.value === game.status,
                  )?.label
                }
              </span>
            )}
          </div>
        </div>
        <h2 className="mt-3 max-w-3xl font-display text-3xl font-black leading-tight tracking-[-0.055em] sm:mt-4 sm:text-4xl lg:text-5xl">
          <Link href={`/tournaments/${game.slug}`} className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            {game.name}
            <ExternalLink animateOnHover className="size-5 shrink-0 text-muted-foreground align-middle" />
          </Link>
        </h2>
        <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-5 text-muted-foreground sm:mt-4 sm:line-clamp-none sm:text-base sm:leading-7">
          {game.description ?? "Compete in free-entry tournaments on Arena."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:mt-6 sm:gap-4">
          {game.developer && (
            <span className="font-mono text-xs uppercase tracking-[0.12em]">
              Dev: {game.developer}
            </span>
          )}
          {game.publisher && (
            <span className="font-mono text-xs uppercase tracking-[0.12em]">
              Publisher: {game.publisher}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}