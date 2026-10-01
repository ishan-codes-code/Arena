import { useTRPC } from "@/app/trpc/client";
import { useQuery } from "@tanstack/react-query";

// Drizzle's schema types declare timestamps as Date, but the postgres driver
// with prepare: false returns strings. The UI doesn't consume date fields, so
// we normalize the inferred type to match runtime behavior.
export type Game = {
  id: string;
  name: string;
  slug: string;
  short_name: string | null;
  description: string | null;
  developer: string | null;
  publisher: string | null;
  icon_url: string | null;
  logo_url: string | null;
  banner_url: string | null;
  status: "active" | "coming_soon" | "inactive" | "archived";
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type GamesResponse = { games: Game[] };

/**
 * Stable, descriptive query key for the games list.
 * Using a namespaced array ensures the key is unique and easy to extend
 * with filters, pagination, or other parameters in the future.
 */
export const gamesQueryKey = ["games", "list"] as const;

/**
 * Hook that wraps useQuery for fetching games via tRPC.
 * Uses the typed queryOptions factory from useTRPC() so the
 * response type is inferred from AppRouter automatically.
 */
export function useGamesQuery() {
  const trpc = useTRPC();

  return useQuery(trpc.games.list.queryOptions());
}