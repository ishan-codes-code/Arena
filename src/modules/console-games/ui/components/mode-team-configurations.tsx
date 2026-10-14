"use client";

import * as React from "react";
import { useId, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Layers,
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import { MotionConfig } from "motion/react";
import { toast } from "sonner";
import { z } from "zod";
import { RippleButton, RippleButtonRipples } from "@/components/animate-ui/components/buttons/ripple";
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SmoothInput } from "@/components/ui/skiper-ui/skiper106";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { createTeamConfigSchema } from "@/modules/games/schemas";
import { AnimatedFieldError } from "./form-field-primitives";

import type {
  GameMode,
  ModeTeamConfiguration,
} from "@/modules/games/queries/modes";
import { useTRPC } from "@/trpc/client";

const inlineTeamConfigSchema = z.object({
  name: createTeamConfigSchema.shape.name,
  team_size: z
    .string()
    .trim()
    .min(1, "Enter a team size.")
    .regex(/^\d+$/, "Team size must be a whole number.")
    .transform(Number)
    .pipe(createTeamConfigSchema.shape.team_size),
});

type InlineTeamConfigInput = z.input<typeof inlineTeamConfigSchema>;
type InlineTeamConfigValues = z.output<typeof inlineTeamConfigSchema>;

const emptyInlineTeamConfig: InlineTeamConfigInput = {
  name: "",
  team_size: "",
};

const smoothInputWrapperClassName =
  "w-full min-w-0 max-w-full rounded-md border border-input bg-background p-0 transition-colors focus-within:border-ring focus-within:outline-none focus-within:ring-3 focus-within:ring-ring/40";
const smoothInputClassName =
  "h-9 w-full min-w-0 px-2.5 text-sm text-foreground placeholder:text-muted-foreground";

type ModeTeamConfigurationsProps = {
  mode: GameMode;
  /** Team configurations data - received from parent, no independent query */
  configs?: ModeTeamConfiguration[] | null;
  isConfigsLoading?: boolean;
  isConfigsError?: boolean;
  configsError?: unknown;
  refetchConfigs?: () => void;
};

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function TeamConfigsSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border/70 bg-card/60"
      aria-busy="true"
      aria-label="Loading team configurations"
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Team Size</TableHead>
            <TableHead className="hidden sm:table-cell">Created</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 3 }).map((_, index) => (
            <TableRow key={`config-skeleton-${index}`} className="border-border/40">
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-4 w-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28 sm:w-36" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-md" />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Skeleton className="size-7 rounded-md" />
                  <Skeleton className="size-7 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TeamConfigsEmptyState({ modeName }: { modeName: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/10 p-8 text-center sm:p-10"
    >
      <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-card shadow-xs">
        <Layers className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <h5 className="mt-3 font-display text-base font-bold tracking-[-0.02em] text-foreground">
        No team configurations yet
      </h5>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
        Configurations define the team sizes available for {modeName} (e.g. Solo, Duo, Squad).
      </p>
    </div>
  );
}

function TeamConfigsErrorState({
  errorMessage,
  onRetry,
}: {
  errorMessage?: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center"
    >
      <div className="flex size-9 items-center justify-center rounded-lg border border-destructive/30 bg-background text-destructive shadow-xs">
        <AlertCircle className="size-4.5" aria-hidden="true" />
      </div>
      <h5 className="mt-2.5 font-display text-sm font-bold tracking-[-0.02em] text-foreground">
        Unable to load team configurations
      </h5>
      <p className="mt-0.5 max-w-sm text-xs text-muted-foreground">
        {errorMessage || "There was a problem fetching configurations for this mode."}
      </p>
      <div className="mt-3.5">
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={onRetry}
          className="h-7 gap-1.5 text-xs"
        >
          <RotateCcw className="size-3" aria-hidden="true" />
          Retry
        </Button>
      </div>
    </div>
  );
}

function ConfigRow({
  config,
  index,
}: {
  config: ModeTeamConfiguration;
  index: number;
}) {
  return (
    <TableRow className="border-border/50 transition-colors hover:bg-muted/30">
      <TableCell className="text-center font-mono text-xs text-muted-foreground">
        {index + 1}
      </TableCell>
      <TableCell>
        <div className="font-medium text-foreground">{config.name}</div>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-xs text-foreground/90">
          <Users className="size-3 text-muted-foreground" aria-hidden="true" />
          <span>
            {config.team_size} {config.team_size === 1 ? "player" : "players"}
          </span>
        </span>
      </TableCell>
      <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
        {formatDate(config.created_at)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled
            className="size-7 text-muted-foreground"
            title="Edit configuration (coming soon)"
            aria-label={`Edit ${config.name} configuration (coming soon)`}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled
            className="size-7 text-muted-foreground hover:text-destructive"
            title="Delete configuration (coming soon)"
            aria-label={`Delete ${config.name} configuration (coming soon)`}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ModeTeamConfigurations({
  mode,
  configs = null,
  isConfigsLoading = false,
  isConfigsError = false,
  configsError,
  refetchConfigs,
}: ModeTeamConfigurationsProps) {
  const [isCreatingConfiguration, setIsCreatingConfiguration] = useState(false);
  const inlineFormId = useId();
  const nameFieldId = `${inlineFormId}-name`;
  const teamSizeFieldId = `${inlineFormId}-team-size`;
  const nameErrorId = `${nameFieldId}-error`;
  const teamSizeErrorId = `${teamSizeFieldId}-error`;
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const form = useForm<InlineTeamConfigInput, undefined, InlineTeamConfigValues>({
    resolver: zodResolver(inlineTeamConfigSchema),
    defaultValues: emptyInlineTeamConfig,
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const createMutation = useMutation(
    trpc.games.modes.configurations.create.mutationOptions({
      onSuccess: async (configuration) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.games.modes.configurations.list.queryKey({
            mode_id: mode.id,
          }),
        });
        toast.success("Configuration added", {
          description: `${configuration.name} (${configuration.team_size}) is now available for ${mode.name}.`,
        });
        form.reset(emptyInlineTeamConfig);
        setIsCreatingConfiguration(false);
      },
      onError: (error) => {
        const code = error.data?.code;
        let description: string;

        if (code === "CONFLICT") {
          description = "A configuration with this team size already exists for this mode.";
          form.setError("team_size", {
            type: "server",
            message: "This team size already exists for this mode.",
          });
          requestAnimationFrame(() => form.setFocus("team_size"));
        } else if (code === "BAD_REQUEST") {
          description = `Team size must be a positive whole number no greater than ${mode.max_players_per_match}.`;
          form.setError("team_size", {
            type: "server",
            message: `Maximum team size is ${mode.max_players_per_match}.`,
          });
          requestAnimationFrame(() => form.setFocus("team_size"));
        } else if (code === "NOT_FOUND") {
          description = "This game mode is no longer available. Refresh the modes list and try again.";
        } else if (code === "UNAUTHORIZED") {
          description = "You must be an admin to add configurations.";
        } else if (code === "FORBIDDEN") {
          description = "You don't have permission to add configurations.";
        } else {
          description = "We couldn't add this configuration. Please try again.";
        }

        toast.error("Could not add configuration", { description });
      },
    }),
  );

  const handleCreateConfiguration = (values: InlineTeamConfigValues) => {
    if (createMutation.isPending) return;

    if (values.team_size > mode.max_players_per_match) {
      form.setError("team_size", {
        type: "validate",
        message: `Maximum team size is ${mode.max_players_per_match}.`,
      });
      requestAnimationFrame(() => form.setFocus("team_size"));
      return;
    }

    createMutation.mutate({
      mode_id: mode.id,
      name: values.name.trim(),
      team_size: values.team_size,
    });
  };

  const handleInvalid = (errors: FieldErrors<InlineTeamConfigInput>) => {
    if (errors.name) {
      requestAnimationFrame(() => form.setFocus("name"));
    } else if (errors.team_size) {
      requestAnimationFrame(() => form.setFocus("team_size"));
    }
  };

  const handleCancelCreation = () => {
    if (createMutation.isPending) return;
    form.reset(emptyInlineTeamConfig);
    setIsCreatingConfiguration(false);
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Section Header */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground sm:text-base">
              Team Configurations
            </h4>
            {!isConfigsLoading && !isConfigsError && configs !== null && (
              <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                {configs.length}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Define the team sizes available for this mode.
          </p>
        </div>

        <MotionConfig reducedMotion="user">
          <RippleButton
            type="button"
            variant="default"
            size="sm"
            disabled={
              configs === null ||
              isConfigsLoading ||
              isConfigsError ||
              isCreatingConfiguration ||
              createMutation.isPending
            }
            aria-expanded={isCreatingConfiguration}
            className="h-8 gap-1.5 text-xs"
            hoverScale={1.015}
            tapScale={0.98}
            onClick={() => setIsCreatingConfiguration(true)}
          >
            <Plus aria-hidden="true" data-icon="inline-start" />
            Add Configuration
            <RippleButtonRipples />
          </RippleButton>
        </MotionConfig>
      </div>

      {/* Content States */}
      <div>
        {isConfigsLoading && <TeamConfigsSkeleton />}

        {isConfigsError && (
          <TeamConfigsErrorState
            errorMessage={
              configsError instanceof Error
                ? configsError.message
                : undefined
            }
            onRetry={refetchConfigs ?? (() => {})}
          />
        )}

        {!isConfigsLoading && !isConfigsError && configs !== null && configs.length === 0 && !isCreatingConfiguration && (
          <TeamConfigsEmptyState modeName={mode.name} />
        )}

        {!isConfigsLoading && !isConfigsError && configs !== null && (configs.length > 0 || isCreatingConfiguration) && (
          <form
            id={inlineFormId}
            onSubmit={form.handleSubmit(handleCreateConfiguration, handleInvalid)}
            noValidate
            className="overflow-hidden rounded-lg border border-border/70 bg-card/60 shadow-xs"
          >
            <Table aria-label={`${mode.name} team configurations`}>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Team Size</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((config, index) => (
                  <ConfigRow
                    key={config.id}
                    config={config}
                    index={index}
                  />
                ))}
                {isCreatingConfiguration && (
                  <TableRow className="border-border/50 align-top hover:bg-transparent">
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {configs.length + 1}
                    </TableCell>
                    <TableCell className="min-w-52 whitespace-normal">
                      <Field
                        data-invalid={form.formState.errors.name ? "true" : undefined}
                        className="min-w-0 gap-1"
                      >
                        <FieldLabel htmlFor={nameFieldId} className="text-xs font-medium">
                          Configuration Name
                          <span aria-hidden="true" className="text-destructive">*</span>
                          <span className="sr-only"> required</span>
                        </FieldLabel>
                        <SmoothInput
                          {...form.register("name")}
                          id={nameFieldId}
                          form={inlineFormId}
                          defaultValue=""
                          required
                          maxLength={80}
                          placeholder="e.g. Trio"
                          aria-required="true"
                          aria-invalid={Boolean(form.formState.errors.name)}
                          aria-describedby={form.formState.errors.name ? nameErrorId : undefined}
                          wrapperClassName={cn(
                            smoothInputWrapperClassName,
                            form.formState.errors.name && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
                          )}
                          className={smoothInputClassName}
                          style={{ fontSize: 14 }}
                        />
                        <AnimatedFieldError
                          id={nameErrorId}
                          message={form.formState.errors.name?.message}
                        />
                      </Field>
                    </TableCell>
                    <TableCell className="min-w-36 whitespace-normal">
                      <Field
                        data-invalid={form.formState.errors.team_size ? "true" : undefined}
                        className="min-w-0 gap-1"
                      >
                        <FieldLabel htmlFor={teamSizeFieldId} className="text-xs font-medium">
                          Team Size
                          <span aria-hidden="true" className="text-destructive">*</span>
                          <span className="sr-only"> required</span>
                        </FieldLabel>
                        <SmoothInput
                          {...form.register("team_size")}
                          id={teamSizeFieldId}
                          form={inlineFormId}
                          defaultValue=""
                          inputMode="numeric"
                          required
                          placeholder="e.g. 3"
                          aria-required="true"
                          aria-invalid={Boolean(form.formState.errors.team_size)}
                          aria-describedby={form.formState.errors.team_size ? teamSizeErrorId : undefined}
                          wrapperClassName={cn(
                            smoothInputWrapperClassName,
                            form.formState.errors.team_size && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
                          )}
                          className={smoothInputClassName}
                          style={{ fontSize: 14 }}
                        />
                        <AnimatedFieldError
                          id={teamSizeErrorId}
                          message={form.formState.errors.team_size?.message}
                        />
                      </Field>
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                      After save
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col justify-end gap-1 sm:flex-row">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={createMutation.isPending}
                          aria-busy={createMutation.isPending}
                          className="whitespace-nowrap"
                        >
                          {createMutation.isPending ? (
                            <>
                              <LoaderCircle aria-hidden="true" data-icon="inline-start" className="animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save aria-hidden="true" data-icon="inline-start" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={createMutation.isPending}
                          onClick={handleCancelCreation}
                        >
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </form>
        )}
      </div>
    </div>
  );
}