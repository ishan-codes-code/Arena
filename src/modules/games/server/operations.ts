import { asc, eq } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@/lib/db";
import { games, type NewGame } from "@/lib/db/schema";
import {
  createGameSchema,
  deleteGameSchema,
  updateGameSchema,
} from "../schemas";

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

export async function updateGame(input: z.infer<typeof updateGameSchema>) {
  const { id, ...fields } = input;
  const updateValues: Partial<NewGame> = {
    ...(fields.name !== undefined && { name: fields.name }),
    ...(fields.slug !== undefined && { slug: fields.slug }),
    ...(fields.short_name !== undefined && {
      short_name: fields.short_name,
    }),
    ...(fields.description !== undefined && {
      description: fields.description,
    }),
    ...(fields.developer !== undefined && { developer: fields.developer }),
    ...(fields.publisher !== undefined && { publisher: fields.publisher }),
    ...(fields.icon_url !== undefined && { icon_url: fields.icon_url }),
    ...(fields.logo_url !== undefined && { logo_url: fields.logo_url }),
    ...(fields.banner_url !== undefined && { banner_url: fields.banner_url }),
    ...(fields.status !== undefined && { status: fields.status }),
    ...(fields.is_featured !== undefined && {
      is_featured: fields.is_featured,
    }),
    ...(fields.sort_order !== undefined && { sort_order: fields.sort_order }),
    updated_at: new Date(),
  };

  try {
    const [updatedGame] = await db
      .update(games)
      .set(updateValues)
      .where(eq(games.id, id))
      .returning();

    if (!updatedGame) {
      throw new GameNotFoundError();
    }

    return updatedGame;
  } catch (error) {
    if (isSlugUniqueViolation(error)) {
      throw new GameSlugConflictError();
    }

    throw error;
  }
}
