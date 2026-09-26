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

import type { Game } from "@/lib/db/schema";

type FeaturedCarouselProps = {
  games: Game[];
};

export function FeaturedCarousel({ games }: FeaturedCarouselProps) {
  const [plugin] = React.useState(() =>
    autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  if (games.length === 0) return null;

  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[plugin]}
      className="relative w-full"
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

      <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2 rounded-full border border-border-strong bg-black/50 text-foreground backdrop-blur-sm hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-ring" />
      <CarouselNext className="right-4 top-1/2 -translate-y-1/2 rounded-full border border-border-strong bg-black/50 text-foreground backdrop-blur-sm hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-ring" />

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
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
          className={cn(
            "h-1 rounded-full transition-all duration-300",
            index === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-foreground/40"
          )}
          onClick={() => api?.scrollTo(index)}
        />
      ))}
    </>
  );
}

function FeaturedSlide({ game }: { game: Game }) {
  const hasImage = Boolean(game.banner_url);

  return (
    <div className="relative h-[calc(100vh-4.5rem)] w-full overflow-hidden bg-slab">
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
        <div className="flex h-full items-center justify-center bg-slab">
          <Gamepad2 className="size-20 text-muted-foreground/20" />
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