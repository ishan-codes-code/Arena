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
      <CarouselContent>
        {games.map((game) => (
          <CarouselItem key={game.id} className="basis-auto pl-4">
            <ComingSoonCard game={game} />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2 hidden md:inline-flex" />
      <CarouselNext className="right-4 top-1/2 -translate-y-1/2 hidden md:inline-flex" />
    </Carousel>
  );
}