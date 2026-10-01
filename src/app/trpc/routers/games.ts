import { db } from "@/lib/db";
import { games } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { baseProcedure, createTRPCRouter } from "../init";

export const gamesRouter = createTRPCRouter({
  list: baseProcedure.query(async () => {
    const result = await db
      .select()
      .from(games)
      .orderBy(asc(games.sort_order), asc(games.name));

    return { games: result };
  }),
});