"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const coverEase = [0.7, 0, 0.84, 0] as const;
const revealEase = [0.16, 1, 0.3, 1] as const;

const contentVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    const hasNavigated = window.sessionStorage.getItem("route-transition-ready");
    if (hasNavigated) {
      const frame = window.requestAnimationFrame(() => setCanAnimate(true));
      return () => window.cancelAnimationFrame(frame);
    } else {
      window.sessionStorage.setItem("route-transition-ready", "true");
    }
  }, []);

  return (
    <div className="relative min-h-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          className="relative min-h-full"
          initial={reducedMotion ? false : "hidden"}
          animate="visible"
          exit="hidden"
          variants={contentVariants}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.1 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {!reducedMotion && canAnimate ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 origin-bottom bg-primary"
          initial={{ scaleY: 0, transformOrigin: "bottom" }}
          animate={{
            scaleY: [0, 1, 1, 0],
            transformOrigin: ["bottom", "bottom", "top", "top"],
          }}
          transition={{
            duration: 0.44,
            times: [0, 0.48, 0.57, 1],
            ease: [coverEase, "linear", "linear", revealEase],
          }}
        />
      ) : null}
    </div>
  );
}