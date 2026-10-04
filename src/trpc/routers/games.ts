import { TRPCError } from "@trpc/server";

import { adminProcedure, baseProcedure, createTRPCRouter } from "../init";
import { createGameSchema } from "@/modules/games/schemas";
import {
  createGame,
  GameSlugConflictError,
  listGames,
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
});
