import { asc, eq } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@/lib/db";
import { games } from "@/lib/db/schema";
import { createGameSchema, deleteGameSchema } from "../schemas";

export class GameSlugConflictError extends Error {
  constructor() {
    super("A game with this slug already exists.");
    this.name = "GameSlugConflictError";
  }
}

export class GameNotFoundError extends Error {
  constructor() {
    super("The game was not found.");
    this.name = "GameNotFoundError";
  }
}

function isSlugUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  if (error.code !== "23505") {
    return false;
  }

  const constraint =
    "constraint_name" in error
      ? error.constraint_name
      : "constraint" in error
        ? error.constraint
        : undefined;

  return constraint === "games_slug_unique";
}

export async function listGames() {
  const result = await db
    .select()
    .from(games)
    .orderBy(asc(games.sort_order), asc(games.name));

  return { games: result };
}

export async function createGame(input: z.infer<typeof createGameSchema>) {
  try {
    const [game] = await db.insert(games).values(input).returning();

    return game;
  } catch (error) {
    if (isSlugUniqueViolation(error)) {
      throw new GameSlugConflictError();
    }

    throw error;
  }
}

export async function deleteGame(input: z.infer<typeof deleteGameSchema>) {
  const [deletedGame] = await db
    .delete(games)
    .where(eq(games.id, input.id))
    .returning({ id: games.id });

  if (!deletedGame) {
    throw new GameNotFoundError();
  }

  return deletedGame;
}
