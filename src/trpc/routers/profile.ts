import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { baseProcedure, createTRPCRouter } from "../init";

export const profileRouter = createTRPCRouter({
  me: baseProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      return null;
    }

    const [profile] = await db
      .select({ role: profiles.role })
      .from(profiles)
      .where(eq(profiles.user_id, ctx.userId))
      .limit(1);

    return profile ?? null;
  }),
});
