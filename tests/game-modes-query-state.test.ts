import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

type GameMode = {
  id: string;
  game_id: string;
  name: string;
  slug: string;
  description: string | null;
  max_players_per_match: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type ModeTeamConfiguration = {
  id: string;
  mode_id: string;
  name: string;
  team_size: number;
  created_at: string;
  updated_at: string;
};

/**
 * Pure state derivation helpers extracted to test the exact logic used in GameModesTab
 */
function deriveActiveSelectedId(
  modes: GameMode[],
  selectedModeId: string | null,
): string | null {
  if (modes.length === 0) return null;
  if (selectedModeId && modes.some((m) => m.id === selectedModeId)) {
    return selectedModeId;
  }
  return modes[0]?.id ?? null;
}

function deriveConfigModeId(params: {
  isDesktop: boolean;
  mobileView: "list" | "details";
  activeSelectedId: string | null;
}): string | null {
  const { isDesktop, mobileView, activeSelectedId } = params;
  return isDesktop
    ? activeSelectedId
    : mobileView === "details"
      ? activeSelectedId
      : null;
}

function filterDisplayedConfigs(
  configurations: ModeTeamConfiguration[] | undefined,
  selectedMode: GameMode | null,
): ModeTeamConfiguration[] | null {
  if (!configurations || !selectedMode) return null;
  return configurations.filter((c) => c.mode_id === selectedMode.id);
}

function deriveConfigsMetricValue(params: {
  isConfigsError: boolean;
  configs: ModeTeamConfiguration[] | null;
}): string | number {
  const { isConfigsError, configs } = params;
  if (isConfigsError) return "—";
  if (configs !== null) return configs.length;
  return "—";
}

const mockModes: GameMode[] = [
  {
    id: "mode-1",
    game_id: "game-123",
    name: "Battle Royale",
    slug: "battle-royale",
    description: "Classic last-team-standing mode",
    max_players_per_match: 50,
    active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "mode-2",
    game_id: "game-123",
    name: "Clash Squad",
    slug: "clash-squad",
    description: "4v4 round-based tactical mode",
    max_players_per_match: 8,
    active: true,
    created_at: "2026-01-02T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "mode-3",
    game_id: "game-123",
    name: "Lone Wolf",
    slug: "lone-wolf",
    description: "1v1 duel mode",
    max_players_per_match: 2,
    active: false,
    created_at: "2026-01-03T00:00:00.000Z",
    updated_at: "2026-01-03T00:00:00.000Z",
  },
];

const mockConfigsMode1: ModeTeamConfiguration[] = [
  {
    id: "config-1",
    mode_id: "mode-1",
    name: "Solo",
    team_size: 1,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "config-2",
    mode_id: "mode-1",
    name: "Squad",
    team_size: 4,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];

const mockConfigsMode2: ModeTeamConfiguration[] = [
  {
    id: "config-3",
    mode_id: "mode-2",
    name: "4v4 Squad",
    team_size: 4,
    created_at: "2026-01-02T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
  },
];

describe("GameModesTab Query-State & Master-Detail Logic", () => {
  describe("Root Cause Bug Fix: Desktop Query State", () => {
    it("enables query for first mode on desktop even when mobileView is 'list'", () => {
      // The bug was: const configModeId = mobileView === 'list' ? null : activeSelectedId;
      // On desktop, mobileView initialized to 'list', causing configModeId to be null and query to be disabled.
      const isDesktop = true;
      const mobileView = "list" as const;
      const activeSelectedId = deriveActiveSelectedId(mockModes, null);

      assert.strictEqual(activeSelectedId, "mode-1");

      const configModeId = deriveConfigModeId({
        isDesktop,
        mobileView,
        activeSelectedId,
      });

      assert.strictEqual(
        configModeId,
        "mode-1",
        "On desktop, query must be enabled for activeSelectedId even when mobileView is 'list'",
      );
    });

    it("enables query for user-selected mode on desktop", () => {
      const isDesktop = true;
      const mobileView = "list" as const;
      const selectedModeId = "mode-2";
      const activeSelectedId = deriveActiveSelectedId(mockModes, selectedModeId);

      assert.strictEqual(activeSelectedId, "mode-2");

      const configModeId = deriveConfigModeId({
        isDesktop,
        mobileView,
        activeSelectedId,
      });

      assert.strictEqual(
        configModeId,
        "mode-2",
        "On desktop, query must fetch configurations for the user-selected mode",
      );
    });
  });

  describe("Mobile Viewport Logic", () => {
    it("disables configuration query while user is on mobile list view", () => {
      const isDesktop = false;
      const mobileView = "list" as const;
      const activeSelectedId = deriveActiveSelectedId(mockModes, null);

      // On mobile list, details panel is not rendered, so query must NOT fire for fallback mode
      const configModeId = deriveConfigModeId({
        isDesktop,
        mobileView,
        activeSelectedId,
      });

      assert.strictEqual(
        configModeId,
        null,
        "On mobile list, config query must be disabled (null)",
      );
    });

    it("enables configuration query when mobile user opens details view", () => {
      const isDesktop = false;
      const selectedModeId = "mode-2";
      const mobileView = "details" as const;
      const activeSelectedId = deriveActiveSelectedId(mockModes, selectedModeId);

      const configModeId = deriveConfigModeId({
        isDesktop,
        mobileView,
        activeSelectedId,
      });

      assert.strictEqual(
        configModeId,
        "mode-2",
        "On mobile details, config query must be enabled for selected mode",
      );
    });

    it("preserves selected mode when returning to mobile list view without firing queries", () => {
      const isDesktop = false;
      // User selected mode-2, then navigated back to list
      const selectedModeId = "mode-2";
      const mobileView = "list" as const;
      const activeSelectedId = deriveActiveSelectedId(mockModes, selectedModeId);

      assert.strictEqual(
        activeSelectedId,
        "mode-2",
        "selectedModeId must be preserved in state",
      );

      const configModeId = deriveConfigModeId({
        isDesktop,
        mobileView,
        activeSelectedId,
      });

      assert.strictEqual(
        configModeId,
        null,
        "Query must be disabled when user is back on the list",
      );
    });
  });

  describe("Viewport Resizing & Transitions", () => {
    it("seamlessly enables query when resizing from mobile list to desktop", () => {
      // Step 1: User is on mobile list
      let isDesktop = false;
      let mobileView = "list" as const;
      let selectedModeId: string | null = null;
      let activeSelectedId = deriveActiveSelectedId(mockModes, selectedModeId);

      let configModeId = deriveConfigModeId({
        isDesktop,
        mobileView,
        activeSelectedId,
      });
      assert.strictEqual(configModeId, null);

      // Step 2: Window resized to desktop (>= 1024px)
      isDesktop = true;
      activeSelectedId = deriveActiveSelectedId(mockModes, selectedModeId);
      configModeId = deriveConfigModeId({
        isDesktop,
        mobileView,
        activeSelectedId,
      });

      assert.strictEqual(
        configModeId,
        "mode-1",
        "Query must immediately enable for the first mode upon transitioning to desktop",
      );
    });

    it("preserves selection when resizing from desktop to mobile", () => {
      // Step 1: User on desktop selects mode-3
      let isDesktop = true;
      let mobileView = "list" as const;
      let selectedModeId: string | null = "mode-3";
      let activeSelectedId = deriveActiveSelectedId(mockModes, selectedModeId);

      assert.strictEqual(activeSelectedId, "mode-3");
      let configModeId = deriveConfigModeId({
        isDesktop,
        mobileView,
        activeSelectedId,
      });
      assert.strictEqual(configModeId, "mode-3");

      // Step 2: Window resized to mobile (< 1024px)
      isDesktop = false;
      activeSelectedId = deriveActiveSelectedId(mockModes, selectedModeId);
      configModeId = deriveConfigModeId({
        isDesktop,
        mobileView,
        activeSelectedId,
      });

      assert.strictEqual(
        selectedModeId,
        "mode-3",
        "Selection is retained across viewport changes",
      );
      assert.strictEqual(
        configModeId,
        null,
        "Mobile list does not run queries for mode-3 until opened",
      );
    });
  });

  describe("Data Integrity & Stale Configurations Prevention", () => {
    it("filters out stale configurations belonging to a different mode", () => {
      const selectedMode = mockModes[1]!; // mode-2
      // Simulate previously cached or in-flight data for mode-1
      const staleDataFromMode1 = mockConfigsMode1;

      const displayedConfigs = filterDisplayedConfigs(
        staleDataFromMode1,
        selectedMode,
      );

      assert.strictEqual(
        displayedConfigs?.length,
        0,
        "Stale configs from mode-1 must not be displayed for mode-2",
      );
    });

    it("displays correct configurations when data matches current mode", () => {
      const selectedMode = mockModes[1]!; // mode-2
      const correctData = mockConfigsMode2;

      const displayedConfigs = filterDisplayedConfigs(
        correctData,
        selectedMode,
      );

      assert.strictEqual(displayedConfigs?.length, 1);
      assert.strictEqual(displayedConfigs?.[0]?.name, "4v4 Squad");
      assert.strictEqual(displayedConfigs?.[0]?.mode_id, "mode-2");
    });
  });

  describe("Non-Misleading Empty and Error States", () => {
    it("returns '—' instead of '0' when configuration query fails", () => {
      const value = deriveConfigsMetricValue({
        isConfigsError: true,
        configs: null,
      });
      assert.strictEqual(value, "—", "Error state must display '—', never '0'");
    });

    it("returns '—' instead of '0' when configurations are missing / null", () => {
      const value = deriveConfigsMetricValue({
        isConfigsError: false,
        configs: null,
      });
      assert.strictEqual(
        value,
        "—",
        "Missing/unloaded configurations must display '—', never '0'",
      );
    });

    it("returns 0 only when query succeeded and confirmed 0 configurations", () => {
      const value = deriveConfigsMetricValue({
        isConfigsError: false,
        configs: [],
      });
      assert.strictEqual(value, 0, "Confirmed empty list displays 0");
    });

    it("returns count when query succeeded with configurations", () => {
      const value = deriveConfigsMetricValue({
        isConfigsError: false,
        configs: mockConfigsMode1,
      });
      assert.strictEqual(value, 2, "Confirmed 2 configurations displays 2");
    });
  });

  describe("Selection Invalidation Resilience", () => {
    it("falls back to first mode if selectedModeId is deleted from modes list", () => {
      const deletedModeId = "mode-999";
      const activeSelectedId = deriveActiveSelectedId(mockModes, deletedModeId);

      assert.strictEqual(
        activeSelectedId,
        "mode-1",
        "Must fall back to first mode if selection is no longer valid",
      );
    });

    it("returns null if modes list is completely empty", () => {
      const activeSelectedId = deriveActiveSelectedId([], "mode-1");
      assert.strictEqual(activeSelectedId, null);
    });
  });
});
