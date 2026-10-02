"use client";

import Image from "next/image";
import {
  useEffect,
  useEffectEvent,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  type FieldErrors,
  type FieldPath,
  type UseFormRegisterReturn,
  type UseFormReturn,
  useForm,
} from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  ImageOff,
  Plus,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogPanel,
  DialogTitle,
} from "@/components/animate-ui/components/headless/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/animate-ui/components/radix/sheet";
import { Switch } from "@/components/animate-ui/components/headless/switch";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { SmoothInput } from "@/components/ui/skiper-ui/skiper106";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  addGameSchema,
  GAME_STATUSES,
  isHttpUrl,
  type AddGameValues,
} from "@/app/modules/games/schemas";

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

const controlWrapperClassName =
  "w-full min-w-0 max-w-full rounded-md border border-input bg-background p-0 transition-colors focus-within:border-ring focus-within:outline-none focus-within:ring-3 focus-within:ring-ring/40";
const controlClassName =
  "h-10 w-full min-w-0 max-w-full px-3 text-sm text-foreground placeholder:text-muted-foreground";

type FieldControlIds = {
  describedBy?: string;
  errorId: string;
};

type FieldFrameProps = {
  id: string;
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  control: (ids: FieldControlIds) => ReactNode;
  afterControl?: ReactNode;
};

function AnimatedFieldError({ id, message }: { id: string; message?: string }) {
  return (
    <div className="min-h-5" aria-live="polite">
      <AnimatePresence initial={false} mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.16 }}
          >
            <FieldError id={id} className="min-w-0 max-w-full break-words">
              {message}
            </FieldError>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldFrame({
  id,
  label,
  required = false,
  description,
  error,
  control,
  afterControl,
}: FieldFrameProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = `${id}-error`;
  const describedBy = [descriptionId, error ? errorId : undefined]
    .filter((value): value is string => Boolean(value))
    .join(" ");

  return (
    <Field
      data-invalid={error ? "true" : undefined}
      className="w-full min-w-0 max-w-full gap-1.5"
    >
      <FieldLabel htmlFor={id}>
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-destructive">*</span>
            <span className="sr-only"> required</span>
          </>
        )}
      </FieldLabel>
      {control({ describedBy: describedBy || undefined, errorId })}
      {afterControl}
      {description && (
        <FieldDescription
          id={descriptionId}
          className="min-w-0 max-w-full break-words text-xs leading-5"
        >
          {description}
        </FieldDescription>
      )}
      <AnimatedFieldError id={errorId} message={error} />
    </Field>
  );
}

type TextInputFieldProps = {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  description?: string;
  required?: boolean;
  type?: "text" | "url";
  maxLength?: number;
};

function TextInputField({
  id,
  label,
  registration,
  error,
  description,
  required,
  type = "text",
  maxLength,
}: TextInputFieldProps) {
  return (
    <FieldFrame
      id={id}
      label={label}
      required={required}
      description={description}
      error={error}
      control={({ describedBy }) => (
        <SmoothInput
          {...registration}
          id={id}
          type={type === "url" ? "text" : type}
          inputMode={type === "url" ? "url" : undefined}
          required={required}
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          maxLength={maxLength}
          className={controlClassName}
          wrapperClassName={cn(
            controlWrapperClassName,
            error && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
          )}
        />
      )}
    />
  );
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function BasicInformationStep({ form }: { form: UseFormReturn<AddGameValues> }) {
  const nameRegistration = form.register("name");
  const slugValue = form.watch("slug");

  const slugError = form.formState.errors.slug?.message;
  const nameError = form.formState.errors.name?.message;

  return (
    <FieldGroup className="w-full min-w-0 gap-4">
      <FieldFrame
        id="game-name"
        label="Game name"
        required
        error={nameError}
        control={({ describedBy }) => (
          <SmoothInput
            {...nameRegistration}
            id="game-name"
            required
            aria-required="true"
            aria-invalid={Boolean(nameError || slugError)}
            aria-describedby={
              [describedBy, "game-slug", slugError ? "game-slug-error" : undefined]
                .filter(Boolean)
                .join(" ") || undefined
            }
            maxLength={120}
            placeholder="e.g. Free Fire MAX"
            className={controlClassName}
            wrapperClassName={cn(
              controlWrapperClassName,
              (nameError || slugError) && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
            )}
            onChange={(event) => {
              const nextName = event.currentTarget.value;
              void nameRegistration.onChange(event);
              form.setValue("slug", slugify(nextName), {
                shouldDirty: true,
                shouldValidate: form.getFieldState("slug").isTouched,
              });
            }}
          />
        )}
        afterControl={
          <div className="grid gap-1">
            <p id="game-slug" className="font-mono text-xs text-muted-foreground">
              Slug: {slugValue || "—"}
            </p>
            <AnimatePresence initial={false}>
              {slugError && (
                <motion.div
                  key={slugError}
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  transition={{ duration: 0.14 }}
                >
                  <FieldError id="game-slug-error">{slugError}</FieldError>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        }
      />

      <TextInputField
        id="game-short-name"
        label="Short name"
        required
        registration={form.register("short_name")}
        error={form.formState.errors.short_name?.message}
        maxLength={40}
        description="A compact name used where space is limited."
      />

      <FieldFrame
        id="game-description"
        label="Description"
        description="Optional. A concise overview shown to players."
        error={form.formState.errors.description?.message}
        control={({ describedBy }) => (
          <Textarea
            {...form.register("description")}
            id="game-description"
            aria-invalid={Boolean(form.formState.errors.description)}
            aria-describedby={describedBy}
            maxLength={10000}
            rows={3}
            placeholder="What should players know about this game?"
            className={cn(
              "min-h-24 resize-y bg-background text-sm",
              form.formState.errors.description && "border-destructive focus-visible:ring-destructive/20",
            )}
          />
        )}
      />

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <TextInputField
          id="game-developer"
          label="Developer"
          registration={form.register("developer")}
          error={form.formState.errors.developer?.message}
          maxLength={120}
        />
        <TextInputField
          id="game-publisher"
          label="Publisher"
          registration={form.register("publisher")}
          error={form.formState.errors.publisher?.message}
          maxLength={120}
        />
      </div>
    </FieldGroup>
  );
}

type ArtworkKind = "icon" | "logo" | "banner";

const artworkPreviewClasses: Record<ArtworkKind, string> = {
  icon: "aspect-square w-16",
  logo: "aspect-[3/1] w-36",
  banner: "aspect-video w-full max-w-64",
};

function ArtworkPreview({
  src,
  label,
  kind,
}: {
  src: string;
  label: string;
  kind: ArtworkKind;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-md border border-border bg-muted",
        artworkPreviewClasses[kind],
      )}
      aria-busy={state === "loading"}
    >
      {state !== "failed" && (
        <Image
          src={src}
          alt={`${label} preview`}
          fill
          unoptimized
          sizes={kind === "banner" ? "256px" : kind === "logo" ? "144px" : "64px"}
          className={cn(
            "object-contain p-1 transition-opacity duration-150",
            state === "loaded" ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setState("loaded")}
          onError={() => setState("failed")}
        />
      )}
      <AnimatePresence initial={false} mode="wait">
        {state === "loading" && (
          <motion.div
            key="preview-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 grid place-items-center text-[11px] text-muted-foreground"
            aria-hidden="true"
          >
            Loading preview
          </motion.div>
        )}
        {state === "failed" && (
          <motion.div
            key="preview-failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center text-[11px] text-muted-foreground"
            role="status"
          >
            <ImageOff aria-hidden="true" className="size-4" />
            <span>Preview unavailable</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArtworkUrlField({
  form,
  name,
  label,
  description,
  kind,
}: {
  form: UseFormReturn<AddGameValues>;
  name: "icon_url" | "logo_url" | "banner_url";
  label: string;
  description: string;
  kind: ArtworkKind;
}) {
  const value = form.watch(name);
  const error = form.formState.errors[name]?.message;
  const showPreview = isHttpUrl(value);

  return (
    <FieldFrame
      id={name}
      label={label}
      required
      description={description}
      error={error}
      control={({ describedBy }) => (
        <SmoothInput
          {...form.register(name)}
          id={name}
          type="text"
          inputMode="url"
          required
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          maxLength={2048}
          placeholder="https://example.com/artwork.png"
          className={controlClassName}
          wrapperClassName={cn(
            controlWrapperClassName,
            error && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
          )}
        />
      )}
      afterControl={
        <AnimatePresence initial={false}>
          {showPreview && (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.16 }}
            >
              <ArtworkPreview key={value} src={value} label={label} kind={kind} />
            </motion.div>
          )}
        </AnimatePresence>
      }
    />
  );
}

function GameArtworkStep({ form }: { form: UseFormReturn<AddGameValues> }) {
  return (
    <FieldGroup className="w-full min-w-0 gap-5">
      <ArtworkUrlField
        form={form}
        name="icon_url"
        label="Icon URL"
        description="Square artwork used to identify the game in compact lists."
        kind="icon"
      />
      <ArtworkUrlField
        form={form}
        name="logo_url"
        label="Logo URL"
        description="A transparent or wide logo for featured placements."
        kind="logo"
      />
      <ArtworkUrlField
        form={form}
        name="banner_url"
        label="Banner URL"
        description="Wide artwork used on the game’s featured presentation."
        kind="banner"
      />
    </FieldGroup>
  );
}

function PublishingSettingsStep({
  form,
  portalContainer,
}: {
  form: UseFormReturn<AddGameValues>;
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
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
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
              onChange={field.onChange}
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

function AddGameWizard({
  form,
  activeStep,
  direction,
  onBack,
  onContinue,
  onSubmit,
  title,
  description,
}: {
  form: UseFormReturn<AddGameValues>;
  activeStep: number;
  direction: number;
  onBack: () => void;
  onContinue: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  title: ReactNode;
  description: ReactNode;
}) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [portalContainer, setPortalContainer] = useState<HTMLFormElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
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
      ref={setPortalContainer}
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
                      {index === 0 && <BasicInformationStep form={form} />}
                      {index === 1 && <GameArtworkStep form={form} />}
                      {index === 2 && (
                        <PublishingSettingsStep form={form} portalContainer={portalContainer} />
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
      <footer className="flex min-w-0 shrink-0 items-center justify-between gap-3 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-7 sm:pb-4">
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
          <Button type="submit" className="h-11 min-w-0 flex-1 sm:min-w-32 sm:flex-none">
            Add game
            <Plus aria-hidden="true" data-icon="inline-end" />
          </Button>
        )}
      </footer>
    </form>
  );
}

export function AddGameForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const form = useForm<AddGameValues>({
    resolver: zodResolver(addGameSchema),
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });

  const resetForm = () => {
    form.reset(defaultValues);
    setActiveStep(0);
    setDirection(1);
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
        requestAnimationFrame(() => form.setFocus("slug"));
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
    // Frontend-only form: keep the user in the wizard after valid validation.
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeStep < steps.length - 1) {
      void handleContinue();
      return;
    }
    void form.handleSubmit(handleValidSubmit, handleInvalid)(event);
  };
  const wizardProps = {
    form,
    activeStep,
    direction,
    onBack: () => navigateToStep(Math.max(activeStep - 1, 0)),
    onContinue: () => void handleContinue(),
    onSubmit: handleFormSubmit,
  };

  return (
    <>
      <Dialog open={open && !isMobile} onClose={handleOpenChange}>
        <DialogPanel
          showCloseButton={false}
          className="h-[min(46rem,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] w-[min(46rem,calc(100vw-2rem))] flex flex-col gap-0 overflow-hidden border-border bg-card p-0 text-card-foreground sm:max-w-none"
        >
          <DialogClose
            aria-label="Close add game form"
            className="absolute right-3 top-3 z-10 inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-4 sm:top-4"
          >
            <X aria-hidden="true" className="size-4" />
          </DialogClose>
          <AddGameWizard
            {...wizardProps}
            title={
              <DialogTitle className="mt-1 font-display text-2xl font-black sm:text-3xl">
                Add game
              </DialogTitle>
            }
            description={
              <DialogDescription className="mt-1 text-sm leading-6">
                Add a title to Arena’s game catalog.
              </DialogDescription>
            }
          />
        </DialogPanel>
      </Dialog>

      <Sheet open={open && isMobile} onOpenChange={handleOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="h-[min(92dvh,52rem)] max-h-[92dvh] gap-0 overflow-hidden rounded-t-xl border-border bg-popover p-0 text-popover-foreground"
        >
          <SheetClose
            aria-label="Close add game form"
            className="absolute right-3 top-3 z-10 inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-4" />
          </SheetClose>
          <AddGameWizard
            {...wizardProps}
            title={
              <SheetTitle className="mt-1 font-display text-2xl font-black">
                Add game
              </SheetTitle>
            }
            description={
              <SheetDescription className="mt-1 text-sm leading-6">
                Add a title to Arena’s game catalog.
              </SheetDescription>
            }
          />
        </SheetContent>
      </Sheet>
    </>
  );
}