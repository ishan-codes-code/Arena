// Drizzle schema entry point.
// Application tables (profiles, games, tournaments, etc.) will be added here
// in future tasks.

import { pgTable, uuid, text, timestamp, pgEnum, boolean, integer } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const gameStatusEnum = pgEnum("game_status", [
  "active",
  "coming_soon",
  "inactive",
  "archived",
]);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").notNull().unique(),
    username: text("username").unique(),
    role: roleEnum("role").notNull().default("user"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
);

export const games = pgTable(
  "games",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    short_name: text("short_name"),
    description: text("description"),
    developer: text("developer"),
    publisher: text("publisher"),
    icon_url: text("icon_url"),
    logo_url: text("logo_url"),
    banner_url: text("banner_url"),
    status: gameStatusEnum("status").notNull().default("active"),
    is_featured: boolean("is_featured").notNull().default(false),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
