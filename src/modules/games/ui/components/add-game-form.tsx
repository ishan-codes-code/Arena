"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type FieldErrors, type FieldPath, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Game } from "@/modules/games/queries/games";
import { useEffect, useMemo, useRef, useState } from "react";

import { useTRPC } from "@/trpc/client";
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
const createStepFields = [
  ["name", "slug", "short_name", "description", "developer", "publisher"],
  ["icon_url", "logo_url", "banner_url"],
  ["status"],
] as const satisfies readonly (readonly FieldPath<GameFormInput>[])[];
const editStepFields = [
  ["name", "slug", "short_name", "description", "developer", "publisher"],
  ["icon_url", "logo_url", "banner_url"],
  ["status", "sort_order"],
] as const satisfies readonly (readonly FieldPath<GameFormInput>[])[];

export type EditGameSubmission = {
  id: string;
  name: string;
  slug: string;
  short_name: string | null;
  description: string | null;
  developer: string | null;
  publisher: string | null;
  icon_url: string | null;
  logo_url: string | null;
  banner_url: string | null;
  status: Game["status"];
  is_featured: boolean;
  sort_order: number;
};

type BaseAddGameFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type CreateGameFormProps = BaseAddGameFormProps & {
  mode?: "create";
};

type EditGameFormProps = BaseAddGameFormProps & {
  mode: "edit";
  game: Game;
  isPending?: boolean;
  onEditSubmit: (values: EditGameSubmission) => void;
};

export type AddGameFormProps = CreateGameFormProps | EditGameFormProps;

type FormControllerProps = BaseAddGameFormProps &
  (
    | { mode: "create" }
    | {
        mode: "edit";
        game: Game;
        isPending?: boolean;
        onEditSubmit: (values: EditGameSubmission) => void;
      }
  );

function getGameFormValues(game: Game): GameFormInput {
  return {
    name: game.name,
    slug: game.slug,
    short_name: game.short_name ?? "",
    description: game.description ?? "",
    developer: game.developer ?? "",
    publisher: game.publisher ?? "",
    icon_url: game.icon_url ?? "",
    logo_url: game.logo_url ?? "",
    banner_url: game.banner_url ?? "",
    status: game.status,
    is_featured: game.is_featured,
    sort_order: game.sort_order,
  };
}

function toEditSubmission(
  gameId: string,
  values: GameFormValues,
): EditGameSubmission {
  return {
    id: gameId,
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
    sort_order: values.sort_order,
  };
}

export function AddGameForm(props: AddGameFormProps) {
  if (props.mode === "edit") {
    return (
      <AddGameFormController
        key={`edit:${props.game.id}`}
        mode="edit"
        game={props.game}
        isPending={props.isPending}
        onEditSubmit={props.onEditSubmit}
        open={props.open}
        onOpenChange={props.onOpenChange}
      />
    );
  }

  return (
    <AddGameFormController
      key="create"
      mode="create"
      open={props.open}
      onOpenChange={props.onOpenChange}
    />
  );
}

function AddGameFormController(props: FormControllerProps) {
  const { open, onOpenChange } = props;
  const mode = props.mode;
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submissionError, setSubmissionError] = useState<string>();
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const gameId = props.mode === "edit" ? props.game.id : undefined;
  const editedGame = props.mode === "edit" ? props.game : undefined;
  const initialValues = useMemo(
    () => (editedGame ? getGameFormValues(editedGame) : defaultValues),
    [editedGame],
  );
  const form = useForm<GameFormInput, undefined, GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: initialValues,
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });
  const previousGameId = useRef<string | undefined>(undefined);
  const {
    formState: { isDirty },
    reset,
  } = form;

  useEffect(() => {
    if (mode !== "edit" || !open || !gameId) return;

    if (previousGameId.current !== gameId || !isDirty) {
      reset(initialValues);
    }
    previousGameId.current = gameId;
  }, [gameId, initialValues, isDirty, mode, open, reset]);

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
    form.reset(initialValues);
    setActiveStep(0);
    setDirection(1);
    setSubmissionError(undefined);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (
      !nextOpen &&
      mode === "edit" &&
      props.mode === "edit" &&
      props.isPending
    ) {
      return;
    }
    if (!nextOpen && mode === "edit") resetForm();
    onOpenChange(nextOpen);
  };

  const handleCancel = () => {
    if (mode !== "create") return;
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
    const fields = mode === "edit" ? editStepFields : createStepFields;
    const isValid = await form.trigger([...fields[activeStep]], {
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
    const fields = mode === "edit" ? editStepFields : createStepFields;
    const invalidStep = fields.findIndex((stepFields) =>
      stepFields.some((fieldName) => Boolean(errors[fieldName])),
    );
    const targetStep = invalidStep < 0 ? activeStep : invalidStep;
    navigateToStep(targetStep);
    const firstInvalid = fields[targetStep]?.find((fieldName) =>
      Boolean(errors[fieldName]),
    );
    if (firstInvalid) {
      requestAnimationFrame(() => form.setFocus(firstInvalid));
    }
  };

  const handleValidSubmit = (values: GameFormValues) => {
    if (props.mode === "edit") {
      if (props.isPending) return;
      props.onEditSubmit(toEditSubmission(props.game.id, values));
      return;
    }

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
    if (mode === "create" && createMutation.isPending) return;
    if (mode === "edit" && props.mode === "edit" && props.isPending) return;
    setSubmissionError(undefined);
    void form.handleSubmit(handleValidSubmit, handleInvalid)();
  };

  const wizardProps: AddGameWizardState = {
    form,
    mode,
    steps,
    activeStep,
    direction,
    onBack: () => navigateToStep(Math.max(activeStep - 1, 0)),
    onContinue: () => void handleContinue(),
    onCancel: handleCancel,
    onAddGame: handleAddGame,
    onSubmit: handleFormSubmit,
    submissionError,
    isPending:
      mode === "create"
        ? createMutation.isPending
        : props.mode === "edit" && Boolean(props.isPending),
  };

  return (
    <>
      <AddGameFormDialog
        open={open}
        onOpenChange={handleOpenChange}
        wizardProps={wizardProps}
      />
      {mode === "create" && (
        <AlertDialog
          open={isDiscardDialogOpen}
          onOpenChange={setIsDiscardDialogOpen}
        >
          <AlertDialogPortal>
            <AlertDialogBackdrop className="fixed inset-0 z-40 bg-black/50" />
            <AlertDialogPopup className="fixed inset-0 z-50 m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md flex-col gap-5 overflow-y-auto border border-border bg-card p-6 text-card-foreground shadow-lg outline-none">
              <AlertDialogHeader className="flex flex-col gap-2">
                <AlertDialogTitle className="font-display text-xl font-bold">
                  Discard this game draft?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
                  Your entered information will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <AlertDialogClose
                  render={
                    <Button type="button" variant="outline">
                      Keep Editing
                    </Button>
                  }
                />
                <AlertDialogClose
                  render={
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={discardDraft}
                    >
                      Discard
                    </Button>
                  }
                />
              </AlertDialogFooter>
            </AlertDialogPopup>
          </AlertDialogPortal>
        </AlertDialog>
      )}
    </>
  );
}
