import { useQuery } from "@tanstack/react-query";
import type { GamesResponse } from "@/lib/api/games";
import { fetchGames } from "@/lib/api/games";

/**
 * Stable, descriptive query key for the games list.
 * Using a namespaced array ensures the key is unique and easy to extend
 * with filters, pagination, or other parameters in the future.
 */
export const gamesQueryKey = ["games", "list"] as const;

/**
 * Query function wrapper that fetches games from the API endpoint.
 * This keeps the query function separate from the view component,
 * allowing for reuse and easier testing.
 */
export function fetchGamesQuery() {
  return fetchGames();
}

/**
 * Hook that wraps useQuery for fetching games.
 * This hook can be reused across the games module without duplicating
 * query logic.
 */
export function useGamesQuery() {
  return useQuery<GamesResponse, Error>({
    queryKey: gamesQueryKey,
    queryFn: fetchGamesQuery,
  });
}