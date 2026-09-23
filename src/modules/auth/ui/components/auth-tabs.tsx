import Link from "next/link";

import { cn } from "@/lib/utils";

type AuthTabsProps = {
  active: "login" | "signup";
};

export function AuthTabs({ active }: AuthTabsProps) {
  return (
    <nav
      aria-label="Authentication"
      className="grid grid-cols-2 border border-border"
    >
      <Link
        href="/login"
        aria-current={active === "login" ? "page" : undefined}
        className={cn(
          "px-2 py-3 text-center font-mono text-[10px] font-medium uppercase tracking-[0.12em] transition-colors sm:px-3 sm:tracking-[0.16em]",
          active === "login"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        Sign in
      </Link>
      <Link
        href="/signup"
        aria-current={active === "signup" ? "page" : undefined}
        className={cn(
          "border-l border-border px-2 py-3 text-center font-mono text-[10px] font-medium uppercase tracking-[0.12em] transition-colors sm:px-3 sm:tracking-[0.16em]",
          active === "signup"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        Sign up
      </Link>
    </nav>
  );
}
