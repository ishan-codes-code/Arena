
"use client";

import { useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
import { AddGameModeFormDialog } from "./add-game-mode-form-dialog";
import { GameModeFormFields } from "./game-mode-form-fields";
import { TeamConfigurationFields } from "./team-configuration-fields";
import {
  addGameModeSchema,
  defaultAddGameModeValues,
  type AddGameModeInput,
  type AddGameModeValues,
} from "./add-game-mode-schema";

export type AddGameModeFormProps = {
  gameId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddGameModeForm({
  gameId,
  open,
  onOpenChange,
}: AddGameModeFormProps) {
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [discardDialogContainer, setDiscardDialogContainer] =
    useState<HTMLFormElement | null>(null);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<AddGameModeInput, undefined, AddGameModeValues>({
    resolver: zodResolver(addGameModeSchema),
    defaultValues: defaultAddGameModeValues,
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });

  const {
    formState: { isDirty },
    reset,
  } = form;

  const resetForm = () => {
    reset(defaultAddGameModeValues);
    setIsDiscardDialogOpen(false);
  };

  const createMutation = useMutation(
    trpc.games.modes.createWithConfigurations.mutationOptions({
      onSuccess: async ({ mode, configurations }) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.games.modes.list.queryKey({ game_id: gameId }),
        });
        toast.success("Game mode created", {
          description: `"${mode.name}" was created with ${configurations.length} team configuration(s).`,
        });
        resetForm();
        onOpenChange(false);
      },
      onError: (error) => {
        const code = error.data?.code;
        const description =
          code === "CONFLICT"
            ? "That mode slug or team size is already in use. Update the slug or team sizes and try again."
            : code === "NOT_FOUND"
              ? "This game is no longer available. Refresh the games list and try again."
              : code === "UNAUTHORIZED"
                ? "You must be an admin to add game modes."
                : code === "FORBIDDEN"
                  ? "You don't have permission to add game modes."
                  : "We couldn't create the game mode. Please try again.";

        toast.error("Failed to create game mode", { description });
      },
    }),
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && createMutation.isPending) return;
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
    if (createMutation.isPending) return;
    if (isDirty) {
      setIsDiscardDialogOpen(true);
      return;
    }
    resetForm();
    onOpenChange(false);
  };

  const discardDraft = () => {
    if (createMutation.isPending) return;
    resetForm();
    onOpenChange(false);
  };

  const handleValidSubmit = (values: AddGameModeValues) => {
    if (createMutation.isPending) return;
    createMutation.mutate({
      game_id: gameId,
      name: values.name,
      slug: values.slug,
      description: values.description || null,
      max_players_per_match: values.max_players_per_match,
      active: values.active,
      team_configurations: values.team_configurations.map((configuration) => ({
        name: configuration.name,
        team_size: configuration.team_size,
      })),
    });
  };

  const handleInvalid = (errors: FieldErrors<AddGameModeInput>) => {
    if (errors.name || errors.slug) {
      requestAnimationFrame(() => form.setFocus("name"));
    } else if (errors.description) {
      requestAnimationFrame(() => form.setFocus("description"));
    } else if (errors.max_players_per_match) {
      requestAnimationFrame(() => form.setFocus("max_players_per_match"));
    } else if (Array.isArray(errors.team_configurations)) {
      const firstInvalidIndex = errors.team_configurations.findIndex(
        (cfg) => Boolean(cfg?.name || cfg?.team_size),
      );
      if (firstInvalidIndex >= 0) {
        const rowErr = errors.team_configurations[firstInvalidIndex];
        if (rowErr?.name) {
          requestAnimationFrame(() =>
            form.setFocus(`team_configurations.${firstInvalidIndex}.name`),
          );
        } else if (rowErr?.team_size) {
          requestAnimationFrame(() =>
            form.setFocus(`team_configurations.${firstInvalidIndex}.team_size`),
          );
        }
      }
    }
  };

  return (
    <>
      <AddGameModeFormDialog open={open} onOpenChange={handleOpenChange}>
        <form
          ref={setDiscardDialogContainer}
          onSubmit={form.handleSubmit(handleValidSubmit, handleInvalid)}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          noValidate
        >
          {/* Scrollable Form Content */}
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8">
            <GameModeFormFields form={form} />
            <TeamConfigurationFields form={form} />
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-border/70 bg-card/80 px-6 py-4 backdrop-blur-xs sm:px-8">
            <Button
              type="button"
              variant="outline"
              disabled={createMutation.isPending}
              onClick={handleCancel}
              className="h-9 px-4 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="h-9 px-4 text-sm font-semibold"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Creating Mode...
                </>
              ) : (
                "Create Mode"
              )}
            </Button>
          </div>
        </form>
      </AddGameModeFormDialog>

      {/* Discard Draft Confirmation Alert Dialog */}
      <AlertDialog
        open={isDiscardDialogOpen}
        onOpenChange={setIsDiscardDialogOpen}
      >
        <AlertDialogPortal container={discardDialogContainer}>
          <AlertDialogBackdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" />
          <AlertDialogPopup className="fixed inset-0 z-50 m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md flex-col gap-5 overflow-y-auto rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none">
            <AlertDialogHeader className="flex flex-col gap-2">
              <AlertDialogTitle className="font-display text-xl font-bold tracking-tight">
                Discard this mode draft?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
                Your entered game mode information and team configurations will be lost.
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
                disabled={createMutation.isPending}
                onClick={discardDraft}
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
