"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/animate-ui/primitives/base/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { slugify } from "@/modules/console-games/lib/slugify";
import type { GameMode, ModeTeamConfiguration } from "@/modules/games/queries/modes";
import { AddGameModeFormDialog } from "./add-game-mode-form-dialog";
import { GameModeFormFields } from "./game-mode-form-fields";
import type { GameModeForm } from "./game-mode-form-fields";
import {
  editGameModeSchema,
  type EditGameModeInput,
  type EditGameModeValues,
} from "./edit-game-mode-schema";

export type EditGameModeFormProps = {
  gameId: string;
  mode: GameMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current team configurations — used to surface a warning when lowering max players */
  configs?: ModeTeamConfiguration[] | null;
};

/**
 * Normalize a description value to what's stored in the database:
 * an empty string becomes null; null/undefined becomes null; otherwise trim.
 */
function normalizeDescription(value: string | undefined | null): string | null {
  if (!value || value.trim() === "") return null;
  return value.trim();
}

/**
 * Build the initial form input values from an existing GameMode.
 */
function modeToFormInput(mode: GameMode): EditGameModeInput {
  return {
    name: mode.name,
    slug: mode.slug,
    description: mode.description ?? "",
    max_players_per_match: String(mode.max_players_per_match),
    active: mode.active,
  };
}

export function EditGameModeForm({
  gameId,
  mode,
  open,
  onOpenChange,
  configs,
}: EditGameModeFormProps) {
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [discardDialogContainer, setDiscardDialogContainer] =
    useState<HTMLFormElement | null>(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<EditGameModeInput, undefined, EditGameModeValues>({
    resolver: zodResolver(editGameModeSchema),
    defaultValues: modeToFormInput(mode),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });

  const { formState: { isDirty }, reset } = form;

  const prevOpenRef = useRef(false);
  const prevModeIdRef = useRef<string | null>(null);

  // Initialize form on dialog open or when switching to a different mode.
  // Refetches of the same mode (identical mode.id) while the dialog is open will not wipe in-progress edits.
  useEffect(() => {
    const isOpening = open && !prevOpenRef.current;
    const isModeChanged = mode.id !== prevModeIdRef.current;

    if (open && (isOpening || isModeChanged)) {
      reset(modeToFormInput(mode));
      prevModeIdRef.current = mode.id;
    }

    prevOpenRef.current = open;
  }, [open, mode, reset]);

  const resetForm = () => {
    reset(modeToFormInput(mode));
    setIsDiscardDialogOpen(false);
  };

  const updateMutation = useMutation(
    trpc.games.modes.update.mutationOptions({
      onSuccess: async (updated) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.games.modes.list.queryKey({ game_id: gameId }),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.games.modes.get.queryKey({ id: mode.id }),
          }),
        ]);
        toast.success("Game mode updated", {
          description: `"${updated.name}" was saved successfully.`,
        });
        resetForm();
        onOpenChange(false);
      },
      onError: (error) => {
        const code = error.data?.code;
        const description =
          code === "BAD_REQUEST"
            ? error.message ||
              "Maximum players per match cannot be less than an existing team configuration's team size."
            : code === "CONFLICT"
              ? "A mode with that slug already exists. Update the mode name and try again."
              : code === "NOT_FOUND"
                ? "This game mode no longer exists. Refresh the modes list and try again."
                : code === "UNAUTHORIZED"
                  ? "You must be an admin to edit game modes."
                  : code === "FORBIDDEN"
                    ? "You don't have permission to edit game modes."
                    : error.message || "We couldn't save the game mode. Please try again.";

        if (code === "BAD_REQUEST") {
          form.setError("max_players_per_match", {
            type: "server",
            message:
              error.message ||
              "Cannot be less than an existing team configuration's team size.",
          });
          requestAnimationFrame(() => form.setFocus("max_players_per_match"));
        }

        toast.error("Failed to save game mode", { description });
      },
    }),
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && updateMutation.isPending) return;
    if (!nextOpen && isDirty) {
      setIsDiscardDialogOpen(true);
      return;
    }
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleCancel = () => {
    if (updateMutation.isPending) return;
    if (isDirty) {
      setIsDiscardDialogOpen(true);
      return;
    }
    resetForm();
    onOpenChange(false);
  };

  const discardChanges = () => {
    if (updateMutation.isPending) return;
    resetForm();
    onOpenChange(false);
  };

  const handleValidSubmit = (values: EditGameModeValues) => {
    if (updateMutation.isPending) return;

    // Build a minimal diff payload — only include fields that actually changed.
    const descNorm = normalizeDescription(values.description);
    const origDescNorm = normalizeDescription(mode.description);

    // Generate slug from the current name value.
    const derivedSlug = slugify(values.name);

    const payload: Record<string, unknown> = { id: mode.id };

    if (values.name.trim() !== mode.name) {
      payload.name = values.name.trim();
    }
    // Include slug only when the name changed AND the derived slug differs.
    if ("name" in payload && derivedSlug !== mode.slug) {
      payload.slug = derivedSlug;
    }
    if (descNorm !== origDescNorm) {
      payload.description = descNorm;
    }
    if (values.max_players_per_match !== mode.max_players_per_match) {
      payload.max_players_per_match = values.max_players_per_match;
    }
    if (values.active !== mode.active) {
      payload.active = values.active;
    }

    // Nothing changed — close without calling the API.
    if (Object.keys(payload).length === 1) {
      onOpenChange(false);
      resetForm();
      return;
    }

    updateMutation.mutate(payload as Parameters<typeof updateMutation.mutate>[0]);
  };

  // Warn when the user has entered a max players value lower than the largest
  // existing team configuration size. This serves as an early client-side UX safeguard;
  // the server also enforces this invariant inside the updateMode transaction.
  const currentMaxPlayers = Number(form.watch("max_players_per_match"));
  const largestConfigSize = configs
    ? Math.max(0, ...configs.map((c) => c.team_size))
    : 0;
  const showMaxPlayersWarning =
    Boolean(configs) &&
    configs!.length > 0 &&
    Number.isFinite(currentMaxPlayers) &&
    currentMaxPlayers < largestConfigSize;

  return (
    <>
      <AddGameModeFormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Edit game mode"
        description="Update the competition rules for this mode. Team configurations are managed separately."
      >
        <form
          ref={setDiscardDialogContainer}
          onSubmit={form.handleSubmit(handleValidSubmit)}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          noValidate
        >
          {/* Scrollable Form Content */}
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8">
            {/* EditGameModeInput shares the same fields as AddGameModeInput minus
                team_configurations, which GameModeFormFields does not access. */}
            <GameModeFormFields form={form as unknown as GameModeForm} />

            {/* Max players warning when lowering below existing team config sizes */}
            {showMaxPlayersWarning && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-700 dark:text-amber-400"
              >
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-px size-3.5 shrink-0"
                />
                <p>
                  The new maximum ({currentMaxPlayers}) is less than the largest
                  existing team configuration size ({largestConfigSize}). You
                  must reduce or remove that configuration before saving, or
                  keep a higher maximum.
                </p>
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-border/70 bg-card/80 px-6 py-4 backdrop-blur-xs sm:px-8">
            <Button
              type="button"
              variant="outline"
              disabled={updateMutation.isPending}
              onClick={handleCancel}
              className="h-9 px-4 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || showMaxPlayersWarning}
              className="h-9 px-4 text-sm font-semibold"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </AddGameModeFormDialog>

      {/* Discard Changes Confirmation */}
      <AlertDialog
        open={isDiscardDialogOpen}
        onOpenChange={setIsDiscardDialogOpen}
      >
        <AlertDialogPortal container={discardDialogContainer}>
          <AlertDialogBackdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" />
          <AlertDialogPopup className="fixed inset-0 z-50 m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md flex-col gap-5 overflow-y-auto rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none">
            <AlertDialogHeader className="flex flex-col gap-2">
              <AlertDialogTitle className="font-display text-xl font-bold tracking-tight">
                Discard unsaved changes?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
                Your changes to{" "}
                <span className="font-medium text-foreground">{mode.name}</span>{" "}
                will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDiscardDialogOpen(false)}
              >
                Keep Editing
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={updateMutation.isPending}
                onClick={discardChanges}
              >
                Discard
              </Button>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  );
}
