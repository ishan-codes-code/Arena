"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MotionConfig } from "motion/react";

import {
  RippleButton,
  RippleButtonRipples,
} from "@/components/animate-ui/components/buttons/ripple";
import { AddGameForm } from "./add-game-form";

export function AddGameAction() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
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
      <AddGameForm open={isOpen} onOpenChange={setIsOpen} />
      </>
    </MotionConfig>
  );
}