"use client";

import * as React from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import autoplay from "embla-carousel-autoplay";

import { ComingSoonCard } from "./coming-soon-card";
import type { Game } from "../../queries/games";

type ComingSoonCarouselProps = {
  games: Game[];
};

export function ComingSoonCarousel({ games }: ComingSoonCarouselProps) {
  const [plugin] = React.useState(() =>
    autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
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
      <CarouselContent className="-ml-4">
        {games.map((game) => (
          <CarouselItem key={game.id} className="basis-auto pl-4">
            <ComingSoonCard game={game} />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious
        size="icon-lg"
        className="left-4 top-1/2 -translate-y-1/2 rounded-full border border-border-strong bg-background/90 text-foreground shadow-sm backdrop-blur-sm hover:bg-background focus-visible:ring-2 focus-visible:ring-ring hidden md:inline-flex"
      />
      <CarouselNext
        size="icon-lg"
        className="right-4 top-1/2 -translate-y-1/2 rounded-full border border-border-strong bg-background/90 text-foreground shadow-sm backdrop-blur-sm hover:bg-background focus-visible:ring-2 focus-visible:ring-ring hidden md:inline-flex"
      />
    </Carousel>
  );
}