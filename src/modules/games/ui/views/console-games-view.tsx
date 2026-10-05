import { ChevronRight } from "lucide-react";

import { AddGameAction } from "../components/add-game-action";
import { GamesTable } from "../components/games-table";

export function ConsoleGamesView() {
  return (
    <main className="flex-1 bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-8 sm:px-6 sm:pt-10 lg:px-10 lg:pt-12">
        <nav aria-label="Breadcrumb" className="mb-5">
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

        <header className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-4xl font-black leading-none sm:text-5xl">
              Games
            </h1>
            <p className="mt-3 max-w-prose text-sm leading-6 text-muted-foreground sm:text-base">
              Manage the games available across Arena.
            </p>
          </div>
          <AddGameAction />
        </header>

        <section className="mt-8">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em] sm:text-4xl mb-4">
            All Games
          </h2>
          <GamesTable />
        </section>
      </div>
    </main>
  );
}