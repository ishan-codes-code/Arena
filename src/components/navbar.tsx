"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar"
import { CircleDot, ArrowUpRight } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Session } from "@supabase/supabase-js"
import { signOut } from "@/modules/auth/lib/auth-client"

const routeTitles: Record<string, string> = {
  "/": "Overview",
  "/tournaments": "Tournaments",
  "/games": "Games",
  "/rankings": "Rankings",
  "/profile": "Profile",
  "/join": "Join Arena",
}

export const Navbar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<Session | null>(null)

  const currentTitle =
    routeTitles[pathname] ??
    (pathname.startsWith("/games/")
      ? "Games"
      : pathname.startsWith("/tournaments/")
      ? "Tournaments"
      : pathname.startsWith("/console")
      ? "Console"
      : "")

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setSession(session)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    await signOut()
    setSession(null)
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-sidebar-border bg-sidebar/95 px-2 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <SidebarTrigger className="size-8 shrink-0 rounded-md text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground" />

        {/* Mobile-only brand identity when sidebar is in drawer */}
        <Link href="/" className="flex shrink-0 items-center gap-1.5 whitespace-nowrap sm:gap-2.5 md:hidden">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary font-display text-xs font-black text-sidebar-primary-foreground shadow-xs">
            A
          </span>
          <span className="font-display text-sm font-black tracking-[-0.04em] text-sidebar-foreground sm:text-base">
            ARENA<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop section breadcrumb: clean Swiss hairline + section title */}
        {currentTitle && (
          <div className="hidden items-center gap-3 md:flex">
            <div className="h-4 w-px bg-sidebar-border" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/60">
              {currentTitle}
            </span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/70 sm:flex">
          <CircleDot className="size-3 text-live shrink-0" />
          <span>1,248 players online</span>
        </div>

        {session?.user?.email ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden font-mono text-[11px] text-sidebar-foreground/70 md:inline-block">
              {session.user.email}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-md border border-sidebar-border bg-transparent px-2 font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors sm:px-3 sm:text-[10px] sm:tracking-[0.14em]"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className="inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-md px-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground sm:px-3 sm:text-[11px] sm:tracking-[0.14em]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-primary px-2 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-primary-foreground shadow-xs transition-transform hover:-translate-y-0.5 active:translate-y-0 sm:gap-1.5 sm:px-3.5 sm:text-[11px] sm:tracking-[0.14em]"
            >
              <span>Enter Arena</span>
              <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}