"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Game } from "@/modules/games/queries/games";
import { isHttpUrl } from "@/modules/games/schemas";
import { useGameUpdateMutation } from "./game-update-mutation";
import {
  GameOverviewTabForm,
  type GameOverviewFormValues,
} from "./game-overview-tab-form";

function getBaselineValues(game: Game): GameOverviewFormValues {
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
    sort_order: game.sort_order ?? 0,
  };
}

function hasFormChanged(
  baseline: GameOverviewFormValues,
  current: GameOverviewFormValues,
): boolean {
  return (
    baseline.name !== current.name ||
    baseline.slug !== current.slug ||
    baseline.short_name !== current.short_name ||
    baseline.description !== current.description ||
    baseline.developer !== current.developer ||
    baseline.publisher !== current.publisher ||
    baseline.icon_url !== current.icon_url ||
    baseline.logo_url !== current.logo_url ||
    baseline.banner_url !== current.banner_url ||
    baseline.status !== current.status ||
    baseline.is_featured !== current.is_featured ||
    baseline.sort_order !== current.sort_order
  );
}

type GameOverviewTabProps = {
  game: Game;
};

export function GameOverviewTab({ game }: GameOverviewTabProps) {
  const router = useRouter();
  const updateMutation = useGameUpdateMutation();

  const [baseline, setBaseline] = React.useState<GameOverviewFormValues>(() =>
    getBaselineValues(game),
  );
  const [formValues, setFormValues] =
    React.useState<GameOverviewFormValues>(() => getBaselineValues(game));
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof GameOverviewFormValues, string>>
  >({});

  const isDirty = React.useMemo(
    () => hasFormChanged(baseline, formValues),
    [baseline, formValues],
  );

  const [prevGame, setPrevGame] = React.useState(game);
  if (prevGame !== game) {
    setPrevGame(game);
    if (!isDirty) {
      const nextBaseline = getBaselineValues(game);
      setBaseline(nextBaseline);
      setFormValues(nextBaseline);
    }
  }

  const updateField = <K extends keyof GameOverviewFormValues>(
    key: K,
    value: GameOverviewFormValues[K],
  ) => {
    setFormValues((previous) => ({ ...previous, [key]: value }));
    if (errors[key]) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof GameOverviewFormValues, string>> =
      {};

    const trimmedName = formValues.name.trim();
    if (!trimmedName) {
      nextErrors.name = "Game name is required.";
    } else if (trimmedName.length > 120) {
      nextErrors.name = "Game name must be 120 characters or fewer.";
    }

    const trimmedSlug = formValues.slug.trim();
    if (!trimmedSlug) {
      nextErrors.slug = "Slug is required.";
    } else if (trimmedSlug.length > 100) {
      nextErrors.slug = "Slug must be 100 characters or fewer.";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSlug)) {
      nextErrors.slug =
        "Use lowercase letters and numbers separated by single hyphens.";
    }

    if (formValues.short_name && formValues.short_name.trim().length > 40) {
      nextErrors.short_name = "Short name must be 40 characters or fewer.";
    }

    if (
      formValues.description &&
      formValues.description.trim().length > 10000
    ) {
      nextErrors.description = "Description must be 10,000 characters or fewer.";
    }

    if (formValues.developer && formValues.developer.trim().length > 120) {
      nextErrors.developer = "Developer must be 120 characters or fewer.";
    }

    if (formValues.publisher && formValues.publisher.trim().length > 120) {
      nextErrors.publisher = "Publisher must be 120 characters or fewer.";
    }

    if (formValues.icon_url && !isHttpUrl(formValues.icon_url)) {
      nextErrors.icon_url = "Enter a complete HTTP or HTTPS URL.";
    }

    if (formValues.logo_url && !isHttpUrl(formValues.logo_url)) {
      nextErrors.logo_url = "Enter a complete HTTP or HTTPS URL.";
    }

    if (formValues.banner_url && !isHttpUrl(formValues.banner_url)) {
      nextErrors.banner_url = "Enter a complete HTTP or HTTPS URL.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCancel = () => {
    setFormValues(baseline);
    setErrors({});
  };

  const handleSave = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (!isDirty || updateMutation.isPending) return;

    if (!validate()) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }

    const payload = {
      id: game.id,
      name: formValues.name.trim(),
      slug: formValues.slug.trim(),
      short_name: formValues.short_name.trim() || null,
      description: formValues.description.trim() || null,
      developer: formValues.developer.trim() || null,
      publisher: formValues.publisher.trim() || null,
      icon_url: formValues.icon_url.trim() || null,
      logo_url: formValues.logo_url.trim() || null,
      banner_url: formValues.banner_url.trim() || null,
      status: formValues.status,
      is_featured: formValues.is_featured,
      sort_order: Number(formValues.sort_order),
    };

    updateMutation.mutate(payload, {
      onSuccess: (updatedGame) => {
        const nextBaseline: GameOverviewFormValues = {
          name: updatedGame.name,
          slug: updatedGame.slug,
          short_name: updatedGame.short_name ?? "",
          description: updatedGame.description ?? "",
          developer: updatedGame.developer ?? "",
          publisher: updatedGame.publisher ?? "",
          icon_url: updatedGame.icon_url ?? "",
          logo_url: updatedGame.logo_url ?? "",
          banner_url: updatedGame.banner_url ?? "",
          status: updatedGame.status,
          is_featured: updatedGame.is_featured,
          sort_order: updatedGame.sort_order,
        };
        setBaseline(nextBaseline);
        setFormValues(nextBaseline);
        setErrors({});

        toast.success("Game updated", {
          description: `Changes for ${updatedGame.name} were saved successfully.`,
        });

        if (updatedGame.slug !== game.slug) {
          router.replace(`/console/games/${updatedGame.slug}`);
        }
      },
    });
  };

  return (
    <GameOverviewTabForm
      game={game}
      formValues={formValues}
      errors={errors}
      isDirty={isDirty}
      isPending={updateMutation.isPending}
      onFieldChange={updateField}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
