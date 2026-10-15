import { z } from "zod";

const modeSlug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter a slug.")
  .max(100, "Slug must be 100 characters or fewer.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters and numbers separated by single hyphens.",
  );

const preprocessInt = (label: string, min = 1) =>
  z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return Number.isNaN(num) ? undefined : num;
    },
    z
      .number({ message: `Enter ${label.toLowerCase()}.` })
      .int("Must be a whole number.")
      .min(min, `${label} must be at least ${min}.`),
  );

/**
 * Schema for the edit mode form.
 *
 * Slug is derived internally from name and never exposed as a direct input.
 * The "slug" field here is used only to carry the derived value through RHF so
 * the preview can display it; the submit handler builds the actual mutation payload
 * by comparing form values against the original mode.
 */
export const editGameModeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a mode name.")
    .max(120, "Mode name must be 120 characters or fewer."),
  slug: modeSlug,
  description: z
    .string()
    .trim()
    .max(10000, "Description must be 10,000 characters or fewer.")
    .optional()
    .default(""),
  max_players_per_match: preprocessInt("Maximum players per match", 1),
  active: z.boolean().default(true),
});

export type EditGameModeInput = z.input<typeof editGameModeSchema>;
export type EditGameModeValues = z.output<typeof editGameModeSchema>;
