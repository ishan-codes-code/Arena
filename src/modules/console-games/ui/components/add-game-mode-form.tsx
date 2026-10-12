
"use client";

import { useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddGameModeForm({ open, onOpenChange }: AddGameModeFormProps) {
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [discardDialogContainer, setDiscardDialogContainer] =
    useState<HTMLFormElement | null>(null);

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

  const handleOpenChange = (nextOpen: boolean) => {
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
    if (isDirty) {
      setIsDiscardDialogOpen(true);
      return;
    }
    resetForm();
    onOpenChange(false);
  };

  const discardDraft = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleValidSubmit = (values: AddGameModeValues) => {
    toast.success("Game mode created", {
      description: `Draft for "${values.name}" with ${values.team_configurations.length} configuration(s) is ready.`,
    });
    resetForm();
    onOpenChange(false);
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
              onClick={handleCancel}
              className="h-9 px-4 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-9 px-4 text-sm font-semibold"
            >
              Create Mode
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
