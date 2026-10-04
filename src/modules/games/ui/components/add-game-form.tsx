"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type FieldErrors, type FieldPath, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useTRPC } from "@/trpc/client";
import { addGameSchema, type AddGameValues } from "@/modules/games/schemas";
import { toast } from "sonner";
import { AddGameFormDialog } from "./add-game-form-dialog";
import type { AddGameWizardState } from "./add-game-wizard";

const defaultValues: AddGameValues = {
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
};

const steps = ["Basic information", "Game artwork", "Publishing settings"] as const;
const stepFields = [
  ["name", "slug", "short_name", "description", "developer", "publisher"],
  ["icon_url", "logo_url", "banner_url"],
  ["status"],
] as const satisfies readonly (readonly FieldPath<AddGameValues>[])[];

export function AddGameForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submissionError, setSubmissionError] = useState<string>();
  const form = useForm<AddGameValues>({
    resolver: zodResolver(addGameSchema),
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });

  const createMutation = useMutation(
    trpc.games.create.mutationOptions({
      onSuccess: () => {
        toast.success("Game added", {
          description: "Game has been added to the catalog.",
        });
        handleOpenChange(false);
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
    form.reset(defaultValues);
    setActiveStep(0);
    setDirection(1);
    setSubmissionError(undefined);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
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

  const handleInvalid = (
    errors: FieldErrors<AddGameValues>,
  ) => {
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

  const handleValidSubmit = () => {
    createMutation.mutate({
      name: form.getValues("name"),
      slug: form.getValues("slug"),
      short_name: form.getValues("short_name") || null,
      description: form.getValues("description") || null,
      developer: form.getValues("developer") || null,
      publisher: form.getValues("publisher") || null,
      icon_url: form.getValues("icon_url") || null,
      logo_url: form.getValues("logo_url") || null,
      banner_url: form.getValues("banner_url") || null,
      status: form.getValues("status"),
      is_featured: form.getValues("is_featured"),
    });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeStep < steps.length - 1) {
      void handleContinue();
    }
  };

  const handleAddGame = () => {
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
    onAddGame: handleAddGame,
    onSubmit: handleFormSubmit,
    submissionError,
    isPending: createMutation.isPending,
  };

  return (
    <AddGameFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      wizardProps={wizardProps}
    />
  );
}