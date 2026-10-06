import { ChevronRight } from "lucide-react";

import { AddGameAction } from "../components/add-game-action";
import { GamesTable } from "../components/games-table";

export function ConsoleGamesView() {
  return (
    <main className="flex-1 bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-10 lg:pt-10">
        <nav aria-label="Breadcrumb" className="mb-4 sm:mb-5">
          <ol className="flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground">
            <li>Console</li>
            <li aria-hidden="true">
              <ChevronRight className="size-3" />
            </li>
            <li aria-current="page" className="text-foreground">
              Games
            </li>
          </ol>
        </nav>

        <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pb-7">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-black leading-tight tracking-[-0.055em] sm:text-4xl lg:text-5xl">
              Games
            </h1>
            <p className="mt-2 max-w-prose text-sm leading-6 text-muted-foreground sm:mt-3 sm:text-base">
              Manage the games available across Arena.
            </p>
          </div>
          <AddGameAction />
        </header>

        <section aria-labelledby="all-games-heading" className="mt-7 sm:mt-8">
          <h2
            id="all-games-heading"
            className="mb-4 font-display text-2xl font-black tracking-[-0.05em] sm:mb-5 sm:text-3xl"
          >
            All Games
          </h2>
          <div className="overflow-hidden rounded-lg border border-border bg-card p-2 sm:p-3">
            <GamesTable />
          </div>
        </section>
      </div>
    </main>
  );
}