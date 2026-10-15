import { and, asc, eq } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@/lib/db";
import {
  gameModes,
  games,
  modeTeamConfigurations,
  type NewGameMode,
  type NewModeTeamConfiguration,
} from "@/lib/db/schema";
import { GameNotFoundError } from "./operations";
import {
  createModeWithConfigurationsSchema,
  updateModeSchema,
  deleteModeSchema,
  getModeSchema,
  listModesSchema,
  createTeamConfigSchema,
  updateTeamConfigSchema,
  deleteTeamConfigSchema,
  listTeamConfigsSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Domain errors — Mode
// ---------------------------------------------------------------------------

export class ModeNotFoundError extends Error {
  constructor() {
    super("The game mode was not found.");
    this.name = "ModeNotFoundError";
  }
}

export class ModeSlugConflictError extends Error {
  constructor() {
    super("A mode with this slug already exists for this game.");
    this.name = "ModeSlugConflictError";
  }
}

// ---------------------------------------------------------------------------
// Domain errors — Team Configuration
// ---------------------------------------------------------------------------

export class TeamConfigNotFoundError extends Error {
  constructor() {
    super("The team configuration was not found.");
    this.name = "TeamConfigNotFoundError";
  }
}

export class TeamConfigConflictError extends Error {
  constructor() {
    super("A configuration with this team size already exists for this mode.");
    this.name = "TeamConfigConflictError";
  }
}

export class TeamConfigMaxPlayersError extends Error {
  constructor() {
    super("The team size exceeds the maximum players per match for this mode.");
    this.name = "TeamConfigMaxPlayersError";
  }
}

// ---------------------------------------------------------------------------
// Postgres constraint helpers
// ---------------------------------------------------------------------------

function isUniqueViolation(error: unknown, constraintName: string): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }
  if (error.code !== "23505") {
    return false;
  }
  const constraint =
    "constraint_name" in error
      ? error.constraint_name
      : "constraint" in error
        ? error.constraint
        : undefined;
  return constraint === constraintName;
}

function isModeSlugConflict(error: unknown): boolean {
  return isUniqueViolation(error, "game_modes_game_id_slug_unique");
}

function isTeamSizeConflict(error: unknown): boolean {
  return isUniqueViolation(error, "mode_team_configurations_mode_id_team_size_unique");
}

function isGameForeignKeyViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }
  if (error.code !== "23503") {
    return false;
  }
  const constraint =
    "constraint_name" in error
      ? error.constraint_name
      : "constraint" in error
        ? error.constraint
        : undefined;
  return constraint === "game_modes_game_id_games_id_fk";
}

// ---------------------------------------------------------------------------
// Mode operations
// ---------------------------------------------------------------------------

export async function listModes(input: z.infer<typeof listModesSchema>) {
  const result = await db
    .select()
    .from(gameModes)
    .where(eq(gameModes.game_id, input.game_id))
    .orderBy(asc(gameModes.name));

  return { modes: result };
}

export async function getMode(input: z.infer<typeof getModeSchema>) {
  const [mode] = await db
    .select()
    .from(gameModes)
    .where(eq(gameModes.id, input.id))
    .limit(1);

  if (!mode) {
    throw new ModeNotFoundError();
  }

  return mode;
}

export async function createModeWithConfigurations(
  input: z.infer<typeof createModeWithConfigurationsSchema>,
) {
  const { team_configurations: configurationsInput, ...modeInput } = input;
  const teamSizes = new Set<number>();
  for (const configuration of configurationsInput) {
    if (teamSizes.has(configuration.team_size)) {
      throw new TeamConfigConflictError();
    }
    teamSizes.add(configuration.team_size);
  }

  try {
    return await db.transaction(async (tx) => {
      const [game] = await tx
        .select({ id: games.id })
        .from(games)
        .where(eq(games.id, modeInput.game_id))
        .limit(1);

      if (!game) {
        throw new GameNotFoundError();
      }

      const [mode] = await tx
        .insert(gameModes)
        .values(modeInput)
        .returning();

      if (!mode) {
        throw new Error("The game mode insert returned no row.");
      }

      const configurations = await tx
        .insert(modeTeamConfigurations)
        .values(
          configurationsInput.map((configuration) => ({
            ...configuration,
            mode_id: mode.id,
          })),
        )
        .returning();

      return { mode, configurations };
    });
  } catch (error) {
    if (isModeSlugConflict(error)) {
      throw new ModeSlugConflictError();
    }
    if (isTeamSizeConflict(error)) {
      throw new TeamConfigConflictError();
    }
    if (isGameForeignKeyViolation(error)) {
      throw new GameNotFoundError();
    }
    throw error;
  }
}

export async function updateMode(input: z.infer<typeof updateModeSchema>) {
  const { id, ...fields } = input;

  try {
    return await db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(gameModes)
        .where(eq(gameModes.id, id))
        .for("update");

      if (!current) {
        throw new ModeNotFoundError();
      }

      const updateValues: Partial<NewGameMode> = {
        ...(fields.name !== undefined &&
          fields.name !== current.name && { name: fields.name }),
        ...(fields.slug !== undefined &&
          fields.slug !== current.slug && { slug: fields.slug }),
        ...(fields.description !== undefined &&
          fields.description !== current.description && { description: fields.description }),
        ...(fields.max_players_per_match !== undefined &&
          fields.max_players_per_match !== current.max_players_per_match && {
            max_players_per_match: fields.max_players_per_match,
          }),
        ...(fields.active !== undefined &&
          fields.active !== current.active && { active: fields.active }),
      };

      if (Object.keys(updateValues).length === 0) {
        return current;
      }

      const [updated] = await tx
        .update(gameModes)
        .set({ ...updateValues, updated_at: new Date() })
        .where(eq(gameModes.id, id))
        .returning();

      if (!updated) {
        throw new ModeNotFoundError();
      }

      return updated;
    });
  } catch (error) {
    if (isModeSlugConflict(error)) {
      throw new ModeSlugConflictError();
    }
    throw error;
  }
}

export async function deleteMode(input: z.infer<typeof deleteModeSchema>) {
  const [deleted] = await db
    .delete(gameModes)
    .where(eq(gameModes.id, input.id))
    .returning({ id: gameModes.id });

  if (!deleted) {
    throw new ModeNotFoundError();
  }

  return deleted;
}

// ---------------------------------------------------------------------------
// Team Configuration operations
// ---------------------------------------------------------------------------

export async function listTeamConfigs(input: z.infer<typeof listTeamConfigsSchema>) {
  const result = await db
    .select()
    .from(modeTeamConfigurations)
    .where(eq(modeTeamConfigurations.mode_id, input.mode_id))
    .orderBy(asc(modeTeamConfigurations.team_size));

  return { configurations: result };
}

export async function createTeamConfig(input: z.infer<typeof createTeamConfigSchema>) {
  try {
    return await db.transaction(async (tx) => {
      const [mode] = await tx
        .select({ max_players_per_match: gameModes.max_players_per_match })
        .from(gameModes)
        .where(eq(gameModes.id, input.mode_id))
        .for("update");

      if (!mode) {
        throw new ModeNotFoundError();
      }

      if (input.team_size > mode.max_players_per_match) {
        throw new TeamConfigMaxPlayersError();
      }

      const [config] = await tx
        .insert(modeTeamConfigurations)
        .values(input)
        .returning();

      if (!config) {
        throw new Error("The team configuration insert returned no row.");
      }

      return config;
    });
  } catch (error) {
    if (isTeamSizeConflict(error)) {
      throw new TeamConfigConflictError();
    }
    throw error;
  }
}

export async function updateTeamConfig(input: z.infer<typeof updateTeamConfigSchema>) {
  const { id, ...fields } = input;

  try {
    return await db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(modeTeamConfigurations)
        .where(eq(modeTeamConfigurations.id, id))
        .for("update");

      if (!current) {
        throw new TeamConfigNotFoundError();
      }

      if (fields.team_size !== undefined) {
        const [mode] = await tx
          .select({ max_players_per_match: gameModes.max_players_per_match })
          .from(gameModes)
          .where(eq(gameModes.id, current.mode_id))
          .for("update");

        if (!mode) {
          throw new ModeNotFoundError();
        }

        if (fields.team_size > mode.max_players_per_match) {
          throw new TeamConfigMaxPlayersError();
        }
      }

      const updateValues: Partial<NewModeTeamConfiguration> = {
        ...(fields.name !== undefined &&
          fields.name !== current.name && { name: fields.name }),
        ...(fields.team_size !== undefined &&
          fields.team_size !== current.team_size && { team_size: fields.team_size }),
      };

      if (Object.keys(updateValues).length === 0) {
        return current;
      }

      const [updated] = await tx
        .update(modeTeamConfigurations)
        .set({ ...updateValues, updated_at: new Date() })
        .where(eq(modeTeamConfigurations.id, id))
        .returning();

      if (!updated) {
        throw new TeamConfigNotFoundError();
      }

      return updated;
    });
  } catch (error) {
    if (isTeamSizeConflict(error)) {
      throw new TeamConfigConflictError();
    }
    throw error;
  }
}

/**
 * Hard-deletes a team configuration.
 *
 * Team configurations are not directly referenced by Tournament records
 * (tournaments reference Modes, not individual team size rows). The database
 * has no ON DELETE RESTRICT from Tournament → TeamConfig, so a hard delete
 * is safe at this stage and consistent with the existing deleteGame pattern.
 */
export async function deleteTeamConfig(input: z.infer<typeof deleteTeamConfigSchema>) {
  const [deleted] = await db
    .delete(modeTeamConfigurations)
    .where(and(eq(modeTeamConfigurations.id, input.id)))
    .returning({ id: modeTeamConfigurations.id });

  if (!deleted) {
    throw new TeamConfigNotFoundError();
  }

  return deleted;
}
