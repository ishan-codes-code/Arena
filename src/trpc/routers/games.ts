import { TRPCError } from "@trpc/server";

import { adminProcedure, baseProcedure, createTRPCRouter } from "../init";
import {
  createGameSchema,
  deleteGameSchema,
  updateGameSchema,
} from "@/modules/games/schemas";
import {
  createGame,
  GameNotFoundError,
  GameSlugConflictError,
  deleteGame,
  listGames,
  updateGame,
} from "@/modules/games/server/operations";

export const gamesRouter = createTRPCRouter({
  list: baseProcedure.query(() => listGames()),

  create: adminProcedure.input(createGameSchema).mutation(async ({ input }) => {
    try {
      return await createGame(input);
    } catch (error) {
      if (error instanceof GameSlugConflictError) {
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

  delete: adminProcedure.input(deleteGameSchema).mutation(async ({ input }) => {
    try {
      return await deleteGame(input);
    } catch (error) {
      if (error instanceof GameNotFoundError) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The game was not found.",
        });
      }

      console.error("Failed to delete game.");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete game.",
      });
    }
  }),

  update: adminProcedure.input(updateGameSchema).mutation(async ({ input }) => {
    try {
      return await updateGame(input);
    } catch (error) {
      if (error instanceof GameNotFoundError) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The game was not found.",
        });
      }

      if (error instanceof GameSlugConflictError) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A game with this slug already exists.",
        });
      }

      console.error("Failed to update game.");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update game.",
      });
    }
  }),
});
