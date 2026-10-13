"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

import {
  useGameModesQuery,
  useModeTeamConfigsQuery,
} from "@/modules/games/queries/modes";
import type { Game } from "@/modules/games/queries/games";
import { useMediaQuery } from "@/hooks/use-mobile";
import { AddGameModeForm } from "./add-game-mode-form";
import {
  GameModesDesktopLayout,
  GameModesEmptyState,
  GameModesErrorState,
  GameModesLoadingState,
  GameModesMobileLayout,
} from "./game-modes-tab-layout";

type GameModesTabProps = {
  game: Game;
};

export function GameModesTab({ game }: GameModesTabProps) {
  const { data, isLoading, isError, error, refetch } = useGameModesQuery(game.id);
  const modes = data?.modes ?? [];

  const [selectedModeId, setSelectedModeId] = React.useState<string | null>(null);
  const [mobileView, setMobileView] = React.useState<"list" | "details">("list");
  const [isAddModeOpen, setIsAddModeOpen] = React.useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const isSelectionValid =
    selectedModeId !== null && modes.some((mode) => mode.id === selectedModeId);

  const activeSelectedId = isSelectionValid
    ? selectedModeId
    : (modes[0]?.id ?? null);

  const selectedMode = modes.find((mode) => mode.id === activeSelectedId) ?? null;

  const previousModesRef = React.useRef(modes);
  if (previousModesRef.current !== modes) {
    previousModesRef.current = modes;
    if (selectedModeId !== null && modes.length > 0 && !isSelectionValid) {
      setSelectedModeId(null);
      if (mobileView === "details") {
        setMobileView("list");
      }
    }
  }

  const configModeId = isDesktop
    ? activeSelectedId
    : mobileView === "details"
      ? activeSelectedId
      : null;

  const {
    data: configsData,
    isLoading: isConfigsQueryLoading,
    isError: isConfigsError,
    error: configsError,
    refetch: refetchConfigs,
  } = useModeTeamConfigsQuery(configModeId ?? "", {
    enabled: Boolean(configModeId),
  });

  const isConfigsLoading =
    isConfigsQueryLoading ||
    (Boolean(configModeId) && configsData === undefined && !isConfigsError);

  const displayedConfigs = React.useMemo(() => {
    if (!configsData?.configurations || !selectedMode) return null;
    return configsData.configurations.filter(
      (configuration) => configuration.mode_id === selectedMode.id,
    );
  }, [configsData, selectedMode]);

  const modeDetails = {
    configs: displayedConfigs,
    isConfigsLoading,
    isConfigsError,
    configsError,
    refetchConfigs,
  };

  if (isLoading) {
    return <GameModesLoadingState />;
  }

  if (isError) {
    return (
      <section aria-label="Game modes">
        <GameModesErrorState
          errorMessage={error?.message}
          onRetry={() => void refetch()}
        />
      </section>
    );
  }

  if (modes.length === 0) {
    return (
      <section aria-label="Game modes">
        <GameModesEmptyState
          gameName={game.name}
          onAddMode={() => setIsAddModeOpen(true)}
        />
        <AddGameModeForm
          open={isAddModeOpen}
          onOpenChange={setIsAddModeOpen}
        />
      </section>
    );
  }

  return (
    <section aria-label="Game modes" className="space-y-6 pb-16">
      <GameModesDesktopLayout
        modes={modes}
        selectedMode={selectedMode}
        selectedModeId={activeSelectedId}
        prefersReducedMotion={prefersReducedMotion}
        details={modeDetails}
        onSelectMode={setSelectedModeId}
        onAddMode={() => setIsAddModeOpen(true)}
      />

      <GameModesMobileLayout
        modes={modes}
        selectedMode={selectedMode}
        listSelectedModeId={selectedModeId}
        mobileView={mobileView}
        prefersReducedMotion={prefersReducedMotion}
        details={modeDetails}
        onSelectMode={(id) => {
          setSelectedModeId(id);
          setMobileView("details");
        }}
        onBackToList={() => setMobileView("list")}
        onAddMode={() => setIsAddModeOpen(true)}
      />

      <AddGameModeForm
        open={isAddModeOpen}
        onOpenChange={setIsAddModeOpen}
      />
    </section>
  );
}
