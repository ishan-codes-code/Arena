"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type FieldErrors, type FieldPath, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useTRPC } from "@/trpc/client";
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
import { AddGameFormDialog } from "./add-game-form-dialog";
import type { AddGameWizardState } from "./add-game-wizard";
import {
  type GameFormInput,
  type GameFormValues,
  gameFormSchema,
} from "./game-form-schema";

const defaultValues: GameFormInput = {
  name: "",
  slug: "",
  short_name: "",
  description: "",
  developer: "",
  publisher: "",
  icon_url: "",
  logo_url: "",
  banner_url: "",
  status: "active",
  is_featured: false,
  sort_order: 0,
};

const steps = ["Basic information", "Game artwork", "Publishing settings"] as const;
const stepFields = [
  ["name", "slug", "short_name", "description", "developer", "publisher"],
  ["icon_url", "logo_url", "banner_url"],
  ["status"],
] as const satisfies readonly (readonly FieldPath<GameFormInput>[])[];

export type AddGameFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddGameForm({ open, onOpenChange }: AddGameFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submissionError, setSubmissionError] = useState<string>();
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [discardDialogContainer, setDiscardDialogContainer] =
    useState<HTMLFormElement | null>(null);

  const form = useForm<GameFormInput, undefined, GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });
  const {
    formState: { isDirty },
    reset,
  } = form;

  const createMutation = useMutation(
    trpc.games.create.mutationOptions({
      onSuccess: () => {
        toast.success("Game added", {
          description: "Game has been added to the catalog.",
        });
        resetForm();
        onOpenChange(false);
        void queryClient.invalidateQueries({
          queryKey: trpc.games.list.queryKey(),
        });
      },
      onError: (error) => {
        if (error.data?.code === "CONFLICT") {
          const message = "A game with this slug already exists.";
          form.setError("slug", { type: "server", message });
          navigateToStep(0);
          requestAnimationFrame(() => form.setFocus("name"));
          toast.error("Duplicate slug", { description: message });
          return;
        }

        const message =
          error.data?.code === "UNAUTHORIZED"
            ? "You must be an admin to add games."
            : error.data?.code === "FORBIDDEN"
              ? "You don't have permission to add games."
              : error.message || "Network error or unexpected failure.";
        const title =
          error.data?.code === "UNAUTHORIZED"
            ? "Unauthorized"
            : error.data?.code === "FORBIDDEN"
              ? "Forbidden"
              : "Failed to add game";

        setSubmissionError(message);
        toast.error(title, { description: message });
      },
    }),
  );

  const resetForm = () => {
    reset(defaultValues);
    setActiveStep(0);
    setDirection(1);
    setSubmissionError(undefined);
  };

  const handleOpenChange = (nextOpen: boolean) => {
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
    setIsDiscardDialogOpen(false);
    onOpenChange(false);
  };

  const navigateToStep = (nextStep: number) => {
    setDirection(nextStep > activeStep ? 1 : -1);
    setActiveStep(nextStep);
  };

  const handleContinue = async () => {
    const isValid = await form.trigger([...stepFields[activeStep]], {
      shouldFocus: true,
    });

    if (!isValid) {
      if (activeStep === 0 && form.getFieldState("slug").invalid) {
        requestAnimationFrame(() => form.setFocus("name"));
      }
      return;
    }

    navigateToStep(Math.min(activeStep + 1, steps.length - 1));
  };

  const handleInvalid = (errors: FieldErrors<GameFormInput>) => {
    const invalidStep = stepFields.findIndex((fields) =>
      fields.some((fieldName) => Boolean(errors[fieldName])),
    );
    const targetStep = invalidStep < 0 ? activeStep : invalidStep;
    navigateToStep(targetStep);
    const firstInvalid = stepFields[targetStep]?.find((fieldName) =>
      Boolean(errors[fieldName]),
    );
    if (firstInvalid) {
      requestAnimationFrame(() => form.setFocus(firstInvalid));
    }
  };

  const handleValidSubmit = (values: GameFormValues) => {
    createMutation.mutate({
      name: values.name,
      slug: values.slug,
      short_name: values.short_name || null,
      description: values.description || null,
      developer: values.developer || null,
      publisher: values.publisher || null,
      icon_url: values.icon_url || null,
      logo_url: values.logo_url || null,
      banner_url: values.banner_url || null,
      status: values.status,
      is_featured: values.is_featured,
    });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeStep < steps.length - 1) {
      void handleContinue();
    }
  };

  const handleAddGame = () => {
    if (createMutation.isPending) return;
    setSubmissionError(undefined);
    void form.handleSubmit(handleValidSubmit, handleInvalid)();
  };

  const wizardProps: AddGameWizardState = {
    form,
    steps,
    activeStep,
    direction,
    onBack: () => navigateToStep(Math.max(activeStep - 1, 0)),
    onContinue: () => void handleContinue(),
    onCancel: handleCancel,
    onFormElementChange: setDiscardDialogContainer,
    onAddGame: handleAddGame,
    onSubmit: handleFormSubmit,
    submissionError,
    isPending: createMutation.isPending,
  };

  return (
    <>
      <AddGameFormDialog
        open={open}
        onOpenChange={handleOpenChange}
        wizardProps={wizardProps}
      />
      <AlertDialog
        open={isDiscardDialogOpen}
        onOpenChange={setIsDiscardDialogOpen}
      >
        <AlertDialogPortal container={discardDialogContainer}>
          <AlertDialogBackdrop className="fixed inset-0 bg-black/50" />
          <AlertDialogPopup className="fixed inset-0 m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md flex-col gap-5 overflow-y-auto border border-border bg-card p-6 text-card-foreground shadow-lg outline-none">
            <AlertDialogHeader className="flex flex-col gap-2">
              <AlertDialogTitle className="font-display text-xl font-bold">
                Discard this game draft?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
                Your entered information will be lost.
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
