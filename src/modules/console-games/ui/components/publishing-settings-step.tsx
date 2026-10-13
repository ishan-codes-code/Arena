"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { GAME_STATUSES } from "@/modules/games/schemas";
import type { GameFormInput, GameFormValues } from "./game-form-schema";
import { FieldFrame } from "./form-field-primitives";

type GameForm = UseFormReturn<GameFormInput, undefined, GameFormValues>;

export function PublishingSettingsStep({
  form,
  portalContainer,
}: {
  form: GameForm;
  portalContainer: HTMLElement | null;
}) {
  const statusError = form.formState.errors.status?.message;

  return (
    <FieldGroup className="w-full min-w-0 gap-5">
      <FieldFrame
        id="game-status"
        label="Status"
        required
        description="Choose how this game is presented across Arena."
        error={statusError}
        control={({ describedBy }) => (
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="game-status"
                  ref={field.ref}
                  onBlur={field.onBlur}
                  aria-required="true"
                  aria-invalid={Boolean(statusError)}
                  aria-describedby={describedBy}
                  className={cn(
                    "h-11 w-full bg-background",
                    statusError && "border-destructive focus-visible:ring-destructive/20",
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start" container={portalContainer}>
                  <SelectGroup>
                    {GAME_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        )}
      />

      <Controller
        name="is_featured"
        control={form.control}
        render={({ field }) => (
          <Field
            orientation="horizontal"
            className="items-center justify-between gap-4 rounded-md border border-border bg-background p-4"
          >
            <FieldContent>
              <FieldLabel htmlFor="game-featured" className="text-sm">
                <span id="game-featured-label">Featured game</span>
              </FieldLabel>
              <FieldDescription id="game-featured-description" className="text-xs leading-5">
                Give this game a prominent position in Arena.
              </FieldDescription>
            </FieldContent>
            <Switch
              id="game-featured"
              ref={field.ref}
              checked={field.value}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
              aria-labelledby="game-featured-label"
              aria-describedby="game-featured-description"
              className="h-6 w-11"
            />
          </Field>
        )}
      />
    </FieldGroup>
  );
}
