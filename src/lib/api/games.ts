import type { Game } from "@/lib/db/schema";

export type GamesResponse = { games: Game[] };

/**
 * Fetches games from the API endpoint
 * This function encapsulates the API call and response parsing
 * It handles HTTP errors explicitly since fetch() doesn't reject on HTTP error status
 */
export async function fetchGames(): Promise<GamesResponse> {
  const response = await fetch("/api/games", {
    // Add headers if needed for authentication, content type, etc.
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Handle HTTP errors explicitly
  if (!response.ok) {
    // Try to parse error response if it exists
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.error ||
      `Failed to fetch games: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  // Parse and return the response data
  return response.json();
}