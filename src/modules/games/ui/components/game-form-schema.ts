import { z } from "zod";

import { addGameSchema, createGameSchema } from "@/modules/games/schemas";

export const gameFormSchema = addGameSchema.extend({
  sort_order: createGameSchema.shape.sort_order?.default(0),
});

export type GameFormInput = z.input<typeof gameFormSchema>;
export type GameFormValues = z.output<typeof gameFormSchema>;
