import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Context = {
  userId?: string;
};

export async function createTRPCContext(_headers: Headers) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { userId: user?.id };
}

const t = initTRPC.context<Context>().create({});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

const authenticatedMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { userId: ctx.userId } });
});

const adminMiddleware = t.middleware(async ({ ctx, next }) => {
  const userId = ctx.userId;
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  try {
    const [profile] = await db
      .select({ role: profiles.role })
      .from(profiles)
      .where(eq(profiles.user_id, userId))
      .limit(1);

    if (!profile || profile.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    console.error("Failed to verify administrator profile.");
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to verify administrator access.",
    });
  }

  return next({ ctx });
});

export const authenticatedProcedure = t.procedure.use(authenticatedMiddleware);
export const adminProcedure = authenticatedProcedure.use(adminMiddleware);
