"use client";

import { type ReactNode } from "react";
import { X } from "lucide-react";

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

export type AddGameModeFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
};

export function AddGameModeFormDialog({
  open,
  onOpenChange,
  title = "Add game mode",
  description = "Configure competition rules and team structures for this game.",
  children,
}: AddGameModeFormDialogProps) {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Desktop View: Centered Animate UI Dialog */}
      <Dialog open={open && !isMobile} onClose={onOpenChange}>
        <DialogPanel
          showCloseButton={false}
          className="h-[min(50rem,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] w-[min(48rem,calc(100vw-2rem))] flex flex-col gap-0 overflow-hidden border-border bg-card p-0 text-card-foreground sm:max-w-none shadow-xl"
        >
          <DialogClose
            aria-label="Close add game mode form"
            className="absolute right-3 top-3 z-10 inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-4 sm:top-4"
          >
            <X aria-hidden="true" className="size-4" />
          </DialogClose>
          <div className="border-b border-border/70 px-6 py-5 sm:px-8">
            <DialogTitle className="font-display text-2xl font-black tracking-[-0.02em] text-foreground sm:text-3xl">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </DialogDescription>
          </div>
          {children}
        </DialogPanel>
      </Dialog>

      {/* Mobile View: Bottom Animate UI Sheet */}
      <Sheet open={open && isMobile} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex h-[min(92dvh,54rem)] max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-t-xl border-border bg-popover p-0 text-popover-foreground"
        >
          <SheetClose
            aria-label="Close add game mode form"
            className="absolute right-3 top-3 z-10 inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-4" />
          </SheetClose>
          <div className="border-b border-border/70 px-5 py-4 sm:px-6">
            <SheetTitle className="font-display text-2xl font-black tracking-[-0.02em] text-foreground">
              {title}
            </SheetTitle>
            <SheetDescription className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
              {description}
            </SheetDescription>
          </div>
          {children}
        </SheetContent>
      </Sheet>
    </>
  );
}
