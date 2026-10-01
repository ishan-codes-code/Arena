import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { gamesRouter } from "./games";

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  games: gamesRouter,
});

// Export type router type
export type AppRouter = typeof appRouter;