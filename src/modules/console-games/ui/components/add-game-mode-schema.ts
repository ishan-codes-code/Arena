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

export const teamConfigItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a configuration name.")
    .max(80, "Name must be 80 characters or fewer."),
  team_size: preprocessInt("Team size", 1),
});

export const addGameModeSchema = z
  .object({
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
    team_configurations: z
      .array(teamConfigItemSchema)
      .min(1, "At least one team configuration is required."),
  })
  .superRefine((data, ctx) => {
    if (!data.team_configurations || data.team_configurations.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one team configuration is required.",
        path: ["team_configurations"],
      });
      return;
    }

    const seenTeamSizes = new Map<number, number>();

    data.team_configurations.forEach((config, index) => {
      const teamSize = config.team_size;
      const maxPlayers = data.max_players_per_match;

      // Validate team size does not exceed max players per match
      if (
        typeof teamSize === "number" &&
        typeof maxPlayers === "number" &&
        teamSize > maxPlayers
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Team size cannot exceed maximum players (${maxPlayers}).`,
          path: ["team_configurations", index, "team_size"],
        });
      }

      // Validate duplicate team sizes within this mode
      if (typeof teamSize === "number" && !Number.isNaN(teamSize)) {
        if (seenTeamSizes.has(teamSize)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate team size (${teamSize}). Each configuration must have a unique team size.`,
            path: ["team_configurations", index, "team_size"],
          });
        } else {
          seenTeamSizes.set(teamSize, index);
        }
      }
    });
  });

export type AddGameModeInput = z.input<typeof addGameModeSchema>;
export type AddGameModeValues = z.output<typeof addGameModeSchema>;
export type TeamConfigInput = z.input<typeof teamConfigItemSchema>;
export type TeamConfigValues = z.output<typeof teamConfigItemSchema>;

export const defaultAddGameModeValues: AddGameModeInput = {
  name: "",
  slug: "",
  description: "",
  max_players_per_match: "",
  active: true,
  team_configurations: [
    {
      name: "",
      team_size: "",
    },
  ],
};
