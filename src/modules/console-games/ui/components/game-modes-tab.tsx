"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/animate-ui/primitives/base/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  useGameModesQuery,
  useModeTeamConfigsQuery,
  type GameMode,
} from "@/modules/games/queries/modes";
import type { Game } from "@/modules/games/queries/games";
import { useMediaQuery } from "@/hooks/use-mobile";
import { useTRPC } from "@/trpc/client";
import { AddGameModeForm } from "./add-game-mode-form";
import { EditGameModeForm } from "./edit-game-mode-form";
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
  const [modeToDelete, setModeToDelete] =
    React.useState<GameMode | null>(null);
  const [modeToEdit, setModeToEdit] =
    React.useState<GameMode | null>(null);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const deleteMutation = useMutation(
    trpc.games.modes.delete.mutationOptions({
      onSuccess: async (result) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.games.modes.list.queryKey({ game_id: game.id }),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.games.modes.get.queryKey({ id: result.id }),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.games.modes.configurations.list.queryKey({
              mode_id: result.id,
            }),
          }),
        ]);
        if (selectedModeId === result.id) {
          setSelectedModeId(null);
          setMobileView("list");
        }
        toast.success("Game mode deleted", {
          description: `${modeToDelete?.name ?? "The game mode"} and its team configurations were permanently deleted.`,
        });
        setModeToDelete(null);
      },
      onError: (mutationError) => {
        const code = mutationError.data?.code;
        const description =
          code === "NOT_FOUND"
            ? "This game mode is no longer available. Refresh the modes list and try again."
            : code === "UNAUTHORIZED"
              ? "You must be an admin to delete game modes."
              : code === "FORBIDDEN"
                ? "You don't have permission to delete game modes."
                : "We couldn't delete this game mode. Please try again.";
        toast.error("Could not delete game mode", { description });
      },
    }),
  );

  const handleConfirmDelete = () => {
    if (!modeToDelete || deleteMutation.isPending) return;
    deleteMutation.mutate({ id: modeToDelete.id });
  };

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
          gameId={game.id}
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
        onRequestDeleteMode={setModeToDelete}
        onRequestEditMode={setModeToEdit}
        isDeletePending={deleteMutation.isPending}
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
        onRequestDeleteMode={setModeToDelete}
        onRequestEditMode={setModeToEdit}
        isDeletePending={deleteMutation.isPending}
      />

      <AddGameModeForm
        gameId={game.id}
        open={isAddModeOpen}
        onOpenChange={setIsAddModeOpen}
      />

      {modeToEdit && (
        <EditGameModeForm
          gameId={game.id}
          mode={modeToEdit}
          open={modeToEdit !== null}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setModeToEdit(null);
          }}
          configs={displayedConfigs}
        />
      )}

      <AlertDialog
        open={modeToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setModeToDelete(null);
          }
        }}
      >
        <AlertDialogPortal>
          <AlertDialogBackdrop className="fixed inset-0 z-40 bg-black/50" />
          <AlertDialogPopup className="fixed inset-0 z-50 m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md flex-col gap-5 overflow-y-auto border border-border bg-card p-6 text-card-foreground shadow-lg outline-none">
            <AlertDialogHeader className="flex flex-col gap-2">
              <AlertDialogTitle className="font-display text-xl font-bold">
                Delete game mode?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
                <span className="break-words font-medium text-foreground">
                  {modeToDelete?.name}
                </span>{" "}
                and all of its team configurations will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialogClose
                render={
                  <Button
                    type="button"
                    variant="outline"
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </Button>
                }
              />
              <Button
                type="button"
                variant="destructive"
                disabled={deleteMutation.isPending}
                aria-busy={deleteMutation.isPending}
                onClick={handleConfirmDelete}
              >
                {deleteMutation.isPending ? (
                  <>
                    <LoaderCircle
                      aria-hidden="true"
                      data-icon="inline-start"
                      className="animate-spin"
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete Mode"
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialogPortal>
      </AlertDialog>
    </section>
  );
}
