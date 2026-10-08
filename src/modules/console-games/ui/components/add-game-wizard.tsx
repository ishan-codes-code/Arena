"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Loader2, Plus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import type { GameFormInput, GameFormValues } from "./game-form-schema";
import {
  BasicInformationStep,
  GameArtworkStep,
  PublishingSettingsStep,
} from "./add-game-form-fields";

export type AddGameWizardState = {
  form: UseFormReturn<GameFormInput, undefined, GameFormValues>;
  steps: readonly string[];
  activeStep: number;
  direction: number;
  onFormElementChange?: (form: HTMLFormElement | null) => void;
  onBack: () => void;
  onCancel: () => void;
  onContinue: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onAddGame: () => void;
  submissionError?: string;
  isPending: boolean;
};

type AddGameWizardProps = AddGameWizardState & {
  title: ReactNode;
  description: ReactNode;
};

export function AddGameWizard({
  form,
  steps,
  activeStep,
  direction,
  onFormElementChange,
  onBack,
  onCancel,
  onContinue,
  onSubmit,
  onAddGame,
  submissionError,
  isPending,
  title,
  description,
}: AddGameWizardProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [portalContainer, setPortalContainer] = useState<HTMLFormElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const handleFormElementChange = useCallback(
    (formElement: HTMLFormElement | null) => {
      setPortalContainer(formElement);
      onFormElementChange?.(formElement);
    },
    [onFormElementChange],
  );
  const alignToCurrentStep = useEffectEvent((api: CarouselApi) => {
    api?.scrollTo(activeStep, Boolean(prefersReducedMotion));
  });

  useEffect(() => {
    if (carouselApi) alignToCurrentStep(carouselApi);
  }, [carouselApi, activeStep]);

  const handleCarouselKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      target.closest("input, textarea, [role=combobox], [contenteditable=true]")
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: "easeOut" as const };

  return (
    <form
      ref={handleFormElementChange}
      noValidate
      onSubmit={onSubmit}
      className="flex h-full min-h-0 flex-col"
      aria-label="Add game"
    >
      <div className="shrink-0 px-5 pb-4 pt-6 sm:px-7 sm:pt-7">
        <div className="pr-12">
          <p className="text-eyebrow">Games / Catalog</p>
          {title}
          {description}
        </div>
      </div>

      <div className="shrink-0 border-y border-border px-5 py-2 sm:px-7">
        <div className="flex min-w-0 items-center justify-between gap-4">
          <p className="min-w-0 truncate text-sm font-medium" aria-live="polite" aria-atomic="true">
            {steps[activeStep]}
          </p>
          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
            {activeStep + 1} of {steps.length}
          </span>
        </div>
        <div
          className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-label="Form progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(((activeStep + 1) / steps.length) * 100)}
          aria-valuetext={`Step ${activeStep + 1} of ${steps.length}: ${steps[activeStep]}`}
        >
          <motion.div
            className="h-full w-full rounded-full bg-primary"
            initial={false}
            animate={{ scaleX: (activeStep + 1) / steps.length }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
          />
        </div>
      </div>

      {submissionError && (
        <div className="px-5 pt-4 sm:px-7">
          <FieldError>{submissionError}</FieldError>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-hidden px-5 py-5 sm:px-7 sm:py-6">
        <Carousel
          setApi={setCarouselApi}
          opts={{ loop: false, watchDrag: false }}
          onKeyDownCapture={handleCarouselKeyDown}
          aria-label="Add game form steps"
          className="h-full min-h-0"
        >
          <CarouselContent className="h-full">
            {steps.map((step, index) => (
              <CarouselItem
                key={step}
                aria-label={step}
                aria-hidden={activeStep !== index}
                inert={activeStep !== index}
                className="h-full min-w-0 overflow-y-auto overscroll-contain"
              >
                <AnimatePresence initial={false} mode="wait">
                  {activeStep === index && (
                    <motion.div
                      key={step}
                      initial={{
                        opacity: 0,
                        x: prefersReducedMotion ? 0 : direction * 12,
                      }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: prefersReducedMotion ? 0 : direction * -12,
                      }}
                      transition={transition}
                      className="min-h-full w-full min-w-0 p-1"
                    >
                      {index === 0 && (
                        <BasicInformationStep form={form} />
                      )}
                      {index === 1 && <GameArtworkStep form={form} />}
                      {index === 2 && (
                        <PublishingSettingsStep
                          form={form}
                          portalContainer={portalContainer}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <Separator />
      <footer className="flex min-w-0 shrink-0 items-center justify-between gap-2 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:gap-3 sm:px-7 sm:pb-4">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={activeStep === 0}
            onClick={onBack}
            className="h-11 min-w-0 flex-shrink-0"
          >
            <ArrowLeft aria-hidden="true" data-icon="inline-start" />
            Back
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={onCancel}
            className="h-11 min-w-0 flex-shrink-0 px-2 sm:px-3"
          >
            Cancel
          </Button>
        </div>
        {activeStep < steps.length - 1 ? (
          <Button
            type="button"
            onClick={onContinue}
            className="h-11 min-w-0 flex-1 sm:min-w-32 sm:flex-none"
          >
            Continue
            <ArrowRight aria-hidden="true" data-icon="inline-end" />
          </Button>
        ) : (
          <Button
            type="button"
            disabled={isPending}
            onClick={onAddGame}
            className="h-11 min-w-0 flex-1 px-2 sm:min-w-28 sm:flex-none"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" data-icon="inline-start" />
                Adding game...
              </>
            ) : (
              <>
                Add game
                <Plus aria-hidden="true" data-icon="inline-end" />
              </>
            )}
          </Button>
        )}
      </footer>
    </form>
  );
}
