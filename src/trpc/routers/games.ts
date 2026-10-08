import { TRPCError } from "@trpc/server";

import { adminProcedure, baseProcedure, createTRPCRouter } from "../init";
import {
  createGameSchema,
  deleteGameSchema,
  updateGameSchema,
  createModeSchema,
  updateModeSchema,
  deleteModeSchema,
  getModeSchema,
  listModesSchema,
  createTeamConfigSchema,
  updateTeamConfigSchema,
  deleteTeamConfigSchema,
  listTeamConfigsSchema,
} from "@/modules/games/schemas";
import {
  createGame,
  GameNotFoundError,
  GameSlugConflictError,
  deleteGame,
  listGames,
  updateGame,
} from "@/modules/games/server/operations";
import {
  listModes,
  getMode,
  createMode,
  updateMode,
  deactivateMode,
  listTeamConfigs,
  createTeamConfig,
  updateTeamConfig,
  deleteTeamConfig,
  ModeNotFoundError,
  ModeSlugConflictError,
  TeamConfigNotFoundError,
  TeamConfigConflictError,
} from "@/modules/games/server/mode-operations";

// ---------------------------------------------------------------------------
// Team configuration sub-router
// ---------------------------------------------------------------------------

const teamConfigurationsRouter = createTRPCRouter({
  list: adminProcedure.input(listTeamConfigsSchema).query(({ input }) =>
    listTeamConfigs(input),
  ),

  create: adminProcedure
    .input(createTeamConfigSchema)
    .mutation(async ({ input }) => {
      try {
        return await createTeamConfig(input);
      } catch (error) {
        if (error instanceof TeamConfigConflictError) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A configuration with this team size already exists for this mode.",
          });
        }
        console.error("Failed to create team configuration.");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create team configuration.",
        });
      }
    }),

  update: adminProcedure
    .input(updateTeamConfigSchema)
    .mutation(async ({ input }) => {
      try {
        return await updateTeamConfig(input);
      } catch (error) {
        if (error instanceof TeamConfigNotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "The team configuration was not found.",
          });
        }
        if (error instanceof TeamConfigConflictError) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A configuration with this team size already exists for this mode.",
          });
        }
        console.error("Failed to update team configuration.");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update team configuration.",
        });
      }
    }),

  delete: adminProcedure
    .input(deleteTeamConfigSchema)
    .mutation(async ({ input }) => {
      try {
        return await deleteTeamConfig(input);
      } catch (error) {
        if (error instanceof TeamConfigNotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "The team configuration was not found.",
          });
        }
        console.error("Failed to delete team configuration.");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete team configuration.",
        });
      }
    }),
});

// ---------------------------------------------------------------------------
// Modes sub-router
// ---------------------------------------------------------------------------

const modesRouter = createTRPCRouter({
  list: adminProcedure.input(listModesSchema).query(({ input }) =>
    listModes(input),
  ),

  get: adminProcedure.input(getModeSchema).query(async ({ input }) => {
    try {
      return await getMode(input);
    } catch (error) {
      if (error instanceof ModeNotFoundError) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The game mode was not found.",
        });
      }
      console.error("Failed to fetch game mode.");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch game mode.",
      });
    }
  }),

  create: adminProcedure
    .input(createModeSchema)
    .mutation(async ({ input }) => {
      try {
        return await createMode(input);
      } catch (error) {
        if (error instanceof ModeSlugConflictError) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A mode with this slug already exists for this game.",
          });
        }
        console.error("Failed to create game mode.");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create game mode.",
        });
      }
    }),

  update: adminProcedure
    .input(updateModeSchema)
    .mutation(async ({ input }) => {
      try {
        return await updateMode(input);
      } catch (error) {
        if (error instanceof ModeNotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "The game mode was not found.",
          });
        }
        if (error instanceof ModeSlugConflictError) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A mode with this slug already exists for this game.",
          });
        }
        console.error("Failed to update game mode.");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update game mode.",
        });
      }
    }),

  delete: adminProcedure
    .input(deleteModeSchema)
    .mutation(async ({ input }) => {
      try {
        return await deactivateMode(input);
      } catch (error) {
        if (error instanceof ModeNotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "The game mode was not found.",
          });
        }
        console.error("Failed to deactivate game mode.");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to deactivate game mode.",
        });
      }
    }),

  configurations: teamConfigurationsRouter,
});

// ---------------------------------------------------------------------------
// Games router
// ---------------------------------------------------------------------------

export const gamesRouter = createTRPCRouter({
  list: baseProcedure.query(() => listGames()),

  create: adminProcedure.input(createGameSchema).mutation(async ({ input }) => {
    try {
      return await createGame(input);
    } catch (error) {
      if (error instanceof GameSlugConflictError) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A game with this slug already exists.",
        });
      }

      console.error("Failed to create game.");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create game.",
      });
    }
  }),

  delete: adminProcedure.input(deleteGameSchema).mutation(async ({ input }) => {
    try {
      return await deleteGame(input);
    } catch (error) {
      if (error instanceof GameNotFoundError) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The game was not found.",
        });
      }

      console.error("Failed to delete game.");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete game.",
      });
    }
  }),

  update: adminProcedure.input(updateGameSchema).mutation(async ({ input }) => {
    try {
      return await updateGame(input);
    } catch (error) {
      if (error instanceof GameNotFoundError) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The game was not found.",
        });
      }

      if (error instanceof GameSlugConflictError) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A game with this slug already exists.",
        });
      }

      console.error("Failed to update game.");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update game.",
      });
    }
  }),

  modes: modesRouter,
});
