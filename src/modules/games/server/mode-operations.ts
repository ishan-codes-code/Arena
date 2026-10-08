import { and, asc, eq } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@/lib/db";
import { gameModes, modeTeamConfigurations, type NewGameMode, type NewModeTeamConfiguration } from "@/lib/db/schema";
import {
  createModeSchema,
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

export async function createMode(input: z.infer<typeof createModeSchema>) {
  try {
    const [mode] = await db.insert(gameModes).values(input).returning();
    return mode;
  } catch (error) {
    if (isModeSlugConflict(error)) {
      throw new ModeSlugConflictError();
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

/**
 * Deactivates a mode rather than hard-deleting it.
 *
 * Modes will eventually be referenced by tournament records. A hard delete
 * would break those references (even with ON DELETE CASCADE the historical
 * data would be lost). Setting active=false keeps the row and its
 * relationships intact while hiding it from normal Console lists.
 *
 * If the mode is already inactive this is a no-op (returns the current row).
 */
export async function deactivateMode(input: z.infer<typeof deleteModeSchema>) {
  const [mode] = await db
    .select({ id: gameModes.id, active: gameModes.active })
    .from(gameModes)
    .where(eq(gameModes.id, input.id))
    .limit(1);

  if (!mode) {
    throw new ModeNotFoundError();
  }

  if (!mode.active) {
    return { id: mode.id };
  }

  const [updated] = await db
    .update(gameModes)
    .set({ active: false, updated_at: new Date() })
    .where(eq(gameModes.id, input.id))
    .returning({ id: gameModes.id });

  if (!updated) {
    throw new ModeNotFoundError();
  }

  return updated;
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
    const [config] = await db
      .insert(modeTeamConfigurations)
      .values(input)
      .returning();
    return config;
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
