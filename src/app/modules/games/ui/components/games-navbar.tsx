"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gamepad2, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { getAuthenticatedEmail, signOut } from "@/modules/auth/lib/auth-client";

export function GamesNavbar() {
  const [email, setEmail] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAuthenticatedEmail().then((value) => {
      if (!cancelled) {
        setEmail(value);
        setChecked(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-18 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center bg-primary font-display text-sm font-black text-primary-foreground">
              A
            </span>
            <span className="font-display text-lg font-black tracking-[-0.04em]">
              ARENA<span className="text-primary">.</span>
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-5 font-body text-[10px] font-bold uppercase tracking-[0.14em] sm:gap-7">
          <Link href="/games" className="text-foreground" aria-current="page">
            Games
          </Link>
          <Link href="/tournaments" className="text-muted-foreground hover:text-foreground">
            Tournaments
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!checked ? null : email ? (
            <>
              <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:flex">
                <span className="size-2 rounded-full bg-live" />
                {email.split("@")[0]}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="inline-flex min-h-9 items-center gap-2 border border-border-strong px-3 font-body text-[10px] font-bold uppercase tracking-[0.14em] hover:bg-muted"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex min-h-9 items-center px-2 font-body text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex min-h-9 items-center bg-primary px-3 font-body text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Enter Arena
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}