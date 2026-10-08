"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

// ---------------------------------------------------------------------------
// Runtime-normalized types
//
// Drizzle's schema infers timestamps as Date, but the postgres driver with
// prepare: false returns strings. Match the pattern established in games.ts.
// ---------------------------------------------------------------------------

export type GameMode = {
  id: string;
  game_id: string;
  name: string;
  slug: string;
  description: string | null;
  max_players_per_match: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type ModeTeamConfiguration = {
  id: string;
  mode_id: string;
  name: string;
  team_size: number;
  created_at: string;
  updated_at: string;
};

export type GameModesResponse = { modes: GameMode[] };
export type TeamConfigurationsResponse = { configurations: ModeTeamConfiguration[] };

// ---------------------------------------------------------------------------
// Mode query hooks
// ---------------------------------------------------------------------------

/**
 * Fetch all modes for a given game.
 *
 * Query key structure: ["games", "modes", "list", game_id]
 * Mirrors the games list key pattern: ["games", "list"]
 */
export function useGameModesQuery(gameId: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.games.modes.list.queryOptions({ game_id: gameId }),
  );
}

/**
 * Fetch a single mode by id.
 *
 * Query key structure: ["games", "modes", "get", id]
 */
export function useGameModeQuery(modeId: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.games.modes.get.queryOptions({ id: modeId }),
  );
}

// ---------------------------------------------------------------------------
// Team configuration query hooks
// ---------------------------------------------------------------------------

/**
 * Fetch all team configurations for a given mode.
 *
 * Query key structure: ["games", "modes", "configurations", "list", mode_id]
 */
export function useModeTeamConfigsQuery(modeId: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.games.modes.configurations.list.queryOptions({ mode_id: modeId }),
  );
}
