import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { asc } from "drizzle-orm";

import { db } from "@/lib/db";
import { gameStatusEnum, games } from "@/lib/db/schema";
import { adminProcedure, baseProcedure, createTRPCRouter } from "../init";

const optionalText = (max: number) =>
  z.string().trim().min(1).max(max).nullable().optional();

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  })
  .nullable()
  .optional();

const createGameInput = z.strictObject({
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  short_name: optionalText(40),
  description: optionalText(10000),
  developer: optionalText(120),
  publisher: optionalText(120),
  icon_url: optionalUrl,
  logo_url: optionalUrl,
  banner_url: optionalUrl,
  status: z.enum(gameStatusEnum.enumValues).optional(),
  is_featured: z.boolean().optional(),
  sort_order: z
    .number()
    .int()
    .min(-2147483648)
    .max(2147483647)
    .optional(),
});

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

export const gamesRouter = createTRPCRouter({
  list: baseProcedure.query(async () => {
    const result = await db
      .select()
      .from(games)
      .orderBy(asc(games.sort_order), asc(games.name));

    return { games: result };
  }),

  create: adminProcedure.input(createGameInput).mutation(async ({ input }) => {
    try {
      const [game] = await db.insert(games).values(input).returning();

      return game;
    } catch (error) {
      if (isSlugUniqueViolation(error)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A game with this slug already exists.",
        });
      }

      console.error("Failed to create game.");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create game.",
      });
    }
  }),
});
