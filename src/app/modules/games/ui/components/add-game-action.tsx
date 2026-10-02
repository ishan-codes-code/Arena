"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogPanel,
  DialogTitle,
} from "@/components/animate-ui/components/headless/dialog";
import {
  RippleButton,
  RippleButtonRipples,
} from "@/components/animate-ui/components/buttons/ripple";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/animate-ui/components/radix/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const addGameDescription = "Add a game to Arena's catalog.";

export function AddGameAction() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <RippleButton
        type="button"
        variant="default"
        size="lg"
        className="h-11 w-full cursor-pointer px-5 sm:w-auto"
        hoverScale={1.015}
        tapScale={0.98}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <Plus aria-hidden="true" data-icon="inline-start" />
        Add game
        <RippleButtonRipples />
      </RippleButton>

      <Dialog open={isOpen && !isMobile} onClose={setIsOpen}>
        <DialogPanel
          showCloseButton={false}
          className="border-border bg-card text-card-foreground"
        >
          <div className="pr-12">
            <DialogTitle className="font-display text-2xl font-black">
              Add game
            </DialogTitle>
            <DialogDescription className="mt-2 leading-6">
              {addGameDescription}
            </DialogDescription>
          </div>
          <DialogClose
            aria-label="Close add game dialog"
            className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-4" />
          </DialogClose>
        </DialogPanel>
      </Dialog>

      <Sheet open={isOpen && isMobile} onOpenChange={setIsOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="h-auto max-h-[85dvh] rounded-t-xl border-border bg-popover px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-6 text-popover-foreground"
        >
          <SheetHeader className="p-0 pr-12">
            <SheetTitle className="font-display text-2xl font-black">
              Add game
            </SheetTitle>
            <SheetDescription className="leading-6">
              {addGameDescription}
            </SheetDescription>
          </SheetHeader>
          <SheetClose
            aria-label="Close add game sheet"
            className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-4" />
          </SheetClose>
        </SheetContent>
      </Sheet>
    </>
  );
}