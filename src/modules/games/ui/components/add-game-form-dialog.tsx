"use client";

import { useIsMobile } from "@/hooks/use-mobile";
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
import { X } from "lucide-react";
import { AddGameWizard, type AddGameWizardState } from "./add-game-wizard";

type AddGameFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wizardProps: AddGameWizardState;
};

export function AddGameFormDialog({
  open,
  onOpenChange,
  wizardProps,
}: AddGameFormDialogProps) {
  const isMobile = useIsMobile();

  return (
    <>
      <Dialog open={open && !isMobile} onClose={onOpenChange}>
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

      <Sheet open={open && isMobile} onOpenChange={onOpenChange}>
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
