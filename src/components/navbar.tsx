"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CircleDot, ArrowUpRight } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { signOut } from "@/modules/auth/lib/auth-client"

export const Navbar = () => {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
  }, [])

  async function handleSignOut() {
    await signOut()
    setSession(null)
    router.refresh()
  }

  return (
    <nav className="border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <Link href="/" className="hidden items-center gap-2 sm:flex">
            <span className="flex size-8 items-center justify-center bg-primary font-display text-sm font-black text-primary-foreground">A</span>
            <span className="font-display text-lg font-black tracking-[-0.04em]">ARENA<span className="text-primary">.</span></span>
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:flex">
            <CircleDot className="size-3 text-live" /> 1,248 players online
          </span>
          {session?.user?.email ? (
            <>
              <span className="font-mono text-[10px] text-muted-foreground">
                {session.user.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex min-h-9 items-center border-0 bg-transparent px-2 font-body text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="inline-flex min-h-9 items-center px-2 font-body text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">Log in</Link>
              <Link href="/signup" className="inline-flex min-h-9 items-center gap-2 bg-primary px-3 font-body text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-0.5">Enter Arena <ArrowUpRight className="size-3.5" /></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}