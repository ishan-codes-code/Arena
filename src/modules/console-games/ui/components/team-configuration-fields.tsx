"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatedFieldError } from "./form-field-primitives";
import type { GameModeForm } from "./game-mode-form-fields";

export function TeamConfigurationFields({ form }: { form: GameModeForm }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "team_configurations",
  });

  const arrayErrors = form.formState.errors.team_configurations;
  // If array has root error (e.g., minimum 1 required)
  const rootErrorMessage = Array.isArray(arrayErrors)
    ? undefined
    : (arrayErrors as { message?: string } | undefined)?.message;

  return (
    <div className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="font-display text-sm font-bold tracking-[-0.01em] text-foreground sm:text-base">
              Team Configurations
            </h4>
            <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
              {fields.length}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure squad sizes supported by this mode (e.g., Solo = 1, Squad = 4).
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: "", team_size: "" as unknown as number })}
          className="h-8 gap-1.5 text-xs"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          <span>Add Config</span>
        </Button>
      </div>

      {/* Root array error (e.g. min 1 configuration required) */}
      {rootErrorMessage && (
        <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-2.5">
          <p className="text-xs font-medium text-destructive">{rootErrorMessage}</p>
        </div>
      )}

      {/* Empty configurations state */}
      {fields.length === 0 ? (
        <div
          role="status"
          className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/10 p-6 text-center"
        >
          <div className="flex size-9 items-center justify-center rounded-md border border-border bg-card">
            <Users className="size-4.5 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="mt-2 text-xs font-semibold text-foreground">
            No configurations added
          </p>
          <p className="mt-0.5 max-w-xs text-[11px] text-muted-foreground">
            At least one configuration is required before saving this mode.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "", team_size: "" as unknown as number })}
            className="mt-3 h-7 gap-1.5 text-xs"
          >
            <Plus className="size-3" aria-hidden="true" />
            Add Configuration
          </Button>
        </div>
      ) : (
        <ul className="space-y-3" aria-label="Team configurations list">
          {fields.map((field, index) => {
            const rowErrors = Array.isArray(arrayErrors) ? arrayErrors[index] : undefined;
            const nameError = rowErrors?.name?.message;
            const sizeError = rowErrors?.team_size?.message;

            const nameId = `team-config-name-${field.id}`;
            const sizeId = `team-config-size-${field.id}`;
            const nameErrorId = `${nameId}-error`;
            const sizeErrorId = `${sizeId}-error`;

            const currentName = form.watch(`team_configurations.${index}.name`);

            return (
              <li
                key={field.id}
                className="rounded-lg border border-border/70 bg-card/40 p-3 transition-colors sm:p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="grid flex-1 gap-3 sm:grid-cols-12 sm:gap-4">
                    {/* Configuration Name */}
                    <div className="sm:col-span-7">
                      <FieldLabel htmlFor={nameId} className="text-xs font-medium">
                        Configuration Name
                        <span aria-hidden="true" className="text-destructive">*</span>
                        <span className="sr-only"> required</span>
                      </FieldLabel>
                      <Input
                        id={nameId}
                        placeholder="e.g. Solo, Duo, Squad"
                        maxLength={80}
                        {...form.register(`team_configurations.${index}.name` as const)}
                        aria-required="true"
                        aria-invalid={Boolean(nameError)}
                        aria-describedby={nameError ? nameErrorId : undefined}
                        className={cn(
                          "mt-1.5 h-9 text-sm",
                          nameError && "border-destructive focus-visible:ring-destructive/20",
                        )}
                      />
                      <AnimatedFieldError id={nameErrorId} message={nameError} />
                    </div>

                    {/* Team Size */}
                    <div className="sm:col-span-5">
                      <FieldLabel htmlFor={sizeId} className="text-xs font-medium">
                        Team Size
                        <span aria-hidden="true" className="text-destructive">*</span>
                        <span className="sr-only"> required</span>
                      </FieldLabel>
                      <Input
                        id={sizeId}
                        type="number"
                        min={1}
                        step={1}
                        inputMode="numeric"
                        placeholder="e.g. 1"
                        {...form.register(`team_configurations.${index}.team_size` as const)}
                        aria-required="true"
                        aria-invalid={Boolean(sizeError)}
                        aria-describedby={sizeError ? sizeErrorId : undefined}
                        className={cn(
                          "mt-1.5 h-9 text-sm",
                          sizeError && "border-destructive focus-visible:ring-destructive/20",
                        )}
                      />
                      <AnimatedFieldError id={sizeErrorId} message={sizeError} />
                    </div>
                  </div>

                  {/* Remove row button */}
                  <div className="pt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      aria-label={`Remove ${currentName || "team configuration"} (Row ${index + 1})`}
                      className="size-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:ring-destructive/30"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
