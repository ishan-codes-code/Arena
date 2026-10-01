import { initTRPC } from "@trpc/server";
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
