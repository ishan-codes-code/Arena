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