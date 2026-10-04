import { z } from "zod";

export const GAME_STATUS_VALUES = [
  "active",
  "coming_soon",
  "inactive",
  "archived",
] as const;

export const GAME_STATUSES = [
  { value: "active", label: "Active" },
  { value: "coming_soon", label: "Coming Soon" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
] as const satisfies readonly {
  value: (typeof GAME_STATUS_VALUES)[number];
  label: string;
}[];

const optionalText = (max: number) =>
  z.string().trim().min(1).max(max).nullable().optional();

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  })
  .nullable()
  .optional();

export const createGameSchema = z.strictObject({
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  short_name: optionalText(40),
  description: optionalText(10000),
  developer: optionalText(120),
  publisher: optionalText(120),
  icon_url: optionalUrl,
  logo_url: optionalUrl,
  banner_url: optionalUrl,
  status: z.enum(GAME_STATUS_VALUES).optional(),
  is_featured: z.boolean().optional(),
  sort_order: z
    .number()
    .int()
    .min(-2147483648)
    .max(2147483647)
    .optional(),
});

export function isHttpUrl(value: string): boolean {
  const trimmedValue = value.trim();
  if (!/^https?:\/\//i.test(trimmedValue)) return false;

  try {
    const url = new URL(trimmedValue);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function artworkUrl(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(2048, `${label} must be 2048 characters or fewer.`)
    .refine(isHttpUrl, `Enter a complete HTTP or HTTPS URL for the ${label.toLowerCase()}.`);
}

export const addGameSchema = z.object({
  name: z.string().trim().min(1, "Enter a game name.").max(120, "Game name must be 120 characters or fewer."),
  slug: z
    .string()
    .trim()
    .min(1, "Enter a slug.")
    .max(100, "Slug must be 100 characters or fewer.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters and numbers separated by single hyphens."),
  short_name: z
    .string()
    .trim()
    .min(1, "Enter a short name.")
    .max(40, "Short name must be 40 characters or fewer."),
  description: z.string().trim().max(10000, "Description must be 10,000 characters or fewer."),
  developer: z.string().trim().max(120, "Developer must be 120 characters or fewer."),
  publisher: z.string().trim().max(120, "Publisher must be 120 characters or fewer."),
  icon_url: artworkUrl("Icon URL"),
  logo_url: artworkUrl("Logo URL"),
  banner_url: artworkUrl("Banner URL"),
  status: z.enum(GAME_STATUS_VALUES),
  is_featured: z.boolean(),
});

export type AddGameValues = z.infer<typeof addGameSchema>;