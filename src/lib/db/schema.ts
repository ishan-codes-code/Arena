// Drizzle schema entry point.
// Application tables (profiles, games, tournaments, etc.) will be added here
// in future tasks.

import { pgTable, uuid, text, timestamp, pgEnum, boolean, integer, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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

export const gameModes = pgTable(
  "game_modes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    game_id: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    max_players_per_match: integer("max_players_per_match").notNull(),
    active: boolean("active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Fast lookups of all modes for a game (also supports the unique slug check)
    index("game_modes_game_id_idx").on(table.game_id),
    // Slug must be unique within a game, not globally
    uniqueIndex("game_modes_game_id_slug_unique").on(table.game_id, table.slug),
  ],
);

export const modeTeamConfigurations = pgTable(
  "mode_team_configurations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mode_id: uuid("mode_id")
      .notNull()
      .references(() => gameModes.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    team_size: integer("team_size").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Fast lookups of all configurations for a mode
    index("mode_team_configurations_mode_id_idx").on(table.mode_id),
    // A given team size may only appear once per mode (e.g. no duplicate "Solo")
    uniqueIndex("mode_team_configurations_mode_id_team_size_unique").on(
      table.mode_id,
      table.team_size,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Drizzle relations
// ---------------------------------------------------------------------------

export const gamesRelations = relations(games, ({ many }) => ({
  modes: many(gameModes),
}));

export const gameModesRelations = relations(gameModes, ({ one, many }) => ({
  game: one(games, {
    fields: [gameModes.game_id],
    references: [games.id],
  }),
  teamConfigurations: many(modeTeamConfigurations),
}));

export const modeTeamConfigurationsRelations = relations(
  modeTeamConfigurations,
  ({ one }) => ({
    mode: one(gameModes, {
      fields: [modeTeamConfigurations.mode_id],
      references: [gameModes.id],
    }),
  }),
);

// ---------------------------------------------------------------------------
// Inferred TypeScript types
// ---------------------------------------------------------------------------

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

export type GameMode = typeof gameModes.$inferSelect;
export type NewGameMode = typeof gameModes.$inferInsert;

export type ModeTeamConfiguration = typeof modeTeamConfigurations.$inferSelect;
export type NewModeTeamConfiguration = typeof modeTeamConfigurations.$inferInsert;
