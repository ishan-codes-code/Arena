import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { gamesRouter } from "./games";
import { profileRouter } from "./profile";

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  games: gamesRouter,
  profile: profileRouter,
});

// Export type router type
export type AppRouter = typeof appRouter;