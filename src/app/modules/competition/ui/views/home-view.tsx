import {
  ArrowUpRight,
  ChevronRight,
  CircleDot,
  Gamepad2,
  Medal,
  ShieldCheck,
  Swords,
  Timer,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";

const tournaments = [
  { name: "Clash Squad // Night Shift", meta: "Bermuda · Solo", time: "09:00 PM", slots: "42 / 48", prize: "Top 3 vouchers", live: true },
  { name: "Battle Royale // Open Run", meta: "Bermuda · Solo", time: "Tomorrow", slots: "31 / 48", prize: "Top 3 vouchers", live: false },
  { name: "Clash Squad // Early Birds", meta: "Alpine · Solo", time: "Sat, 10:00 AM", slots: "12 / 48", prize: "Top 3 vouchers", live: false },
];

export function HomeView() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <Link href="/" className="hidden items-center gap-2 sm:flex">
              <span className="flex size-8 items-center justify-center bg-primary font-display text-sm font-black text-primary-foreground">A</span>
              <span className="font-display text-lg font-black tracking-[-0.04em]">ARENA<span className="text-primary">.</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:flex"><CircleDot className="size-3 text-live" /> 1,248 players online</span>
            <Link href="/login" className="inline-flex min-h-9 items-center px-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">Log in</Link>
            <Link href="/signup" className="inline-flex min-h-9 items-center gap-2 bg-primary px-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-0.5">Enter Arena <ArrowUpRight className="size-3.5" /></Link>
          </div>
        </div>
      </header>

      <div className="arena-grid">
        <section className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 pb-12 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-12 lg:px-10 lg:pb-16 lg:pt-16">
          <div className="flex min-w-0 flex-col justify-between gap-10">
            <div>
              <div className="mb-6 flex flex-wrap items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:mb-8"><span className="text-primary">01 / 03</span><span className="h-px w-8 bg-border-strong" /><span>Free entry · India</span></div>
              <h1 className="max-w-4xl font-display text-[3.8rem] leading-[0.84] font-black tracking-[-0.07em] sm:text-7xl lg:text-[8.5rem]">YOUR NEXT<br /><span className="text-primary">WIN STARTS</span><br />HERE.</h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:mt-9 sm:text-lg">Everyday players. Real rooms. Direct vouchers. Find a free tournament, lock your slot, and make your name travel.</p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <a href="#tournaments" className="inline-flex min-h-12 items-center justify-center gap-3 bg-primary px-5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground transition-transform hover:-translate-y-0.5">Find your match <ArrowUpRight className="size-4" /></a>
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"><ShieldCheck className="size-4 text-live" /> No entry fees. Ever.</span>
            </div>
          </div>

          <div className="arena-cut-panel-tight relative overflow-hidden border border-border-strong bg-card p-4 shadow-[12px_12px_0_var(--border)] sm:p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
            <div className="flex items-center justify-between border-b border-border pb-4 font-mono text-[10px] uppercase tracking-[0.16em]"><span className="flex items-center gap-2 text-live"><span className="size-2 animate-pulse rounded-full bg-live" /> Live registration</span><span className="text-muted-foreground">Room 01 / 12</span></div>
            <div className="relative py-8 sm:py-12">
              <div className="absolute right-0 top-8 font-display text-8xl font-black leading-none text-primary/10 sm:text-[9rem]">01</div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Free Fire MAX · Clash Squad</p>
              <h2 className="relative mt-4 max-w-sm font-display text-4xl leading-[0.9] font-black tracking-[-0.06em] sm:text-6xl">NIGHT<br /><span className="text-primary">SHIFT.</span></h2>
              <div className="mt-8 grid grid-cols-3 gap-2 border-y border-border py-4 font-mono text-[10px] uppercase tracking-[0.08em] sm:gap-4"><div><span className="block text-muted-foreground">Starts in</span><strong className="mt-2 block text-sm text-foreground">02:14:08</strong></div><div><span className="block text-muted-foreground">Slots</span><strong className="mt-2 block text-sm text-foreground">42 / 48</strong></div><div><span className="block text-muted-foreground">Reward</span><strong className="mt-2 block text-sm text-primary">Top 3</strong></div></div>
              <div className="mt-6 flex items-center gap-2"><div className="h-1.5 flex-1 bg-muted"><div className="h-full w-[87%] bg-primary" /></div><span className="font-mono text-[10px] text-muted-foreground">87%</span></div>
            </div>
            <Link href="/signup" className="flex min-h-12 items-center justify-between border border-border-strong px-4 font-mono text-xs font-bold uppercase tracking-[0.12em] transition-colors hover:bg-primary hover:text-primary-foreground"><span>Lock my slot</span><ChevronRight className="size-4" /></Link>
          </div>
        </section>
      </div>

      <section className="border-y border-border bg-card" id="tournaments">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">The room list</p><h2 className="font-display text-4xl font-black tracking-[-0.06em] sm:text-5xl">Pick your pressure.</h2></div><Link href="/tournaments" className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">View all rooms <ArrowUpRight className="size-4" /></Link></div>
          <div className="border-t-2 border-border-strong">
            {tournaments.map((tournament, index) => <Link href="/tournaments" key={tournament.name} className="group grid gap-3 border-b border-border py-5 transition-colors hover:bg-muted/50 sm:grid-cols-[36px_minmax(0,1.5fr)_0.7fr_0.7fr_0.8fr_24px] sm:items-center sm:gap-4 sm:px-3"><span className="font-mono text-xs text-muted-foreground">0{index + 1}</span><span><span className="flex items-center gap-2 font-display text-xl font-bold tracking-[-0.03em]">{tournament.live ? <span className="size-2 bg-live" /> : null}{tournament.name}</span><span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{tournament.meta}</span></span><span className="font-mono text-xs text-muted-foreground"><Timer className="mr-2 inline size-3.5" />{tournament.time}</span><span className="font-mono text-xs text-muted-foreground"><Users className="mr-2 inline size-3.5" />{tournament.slots}</span><span className="font-mono text-xs text-primary">{tournament.prize}</span><ChevronRight className="hidden size-4 text-muted-foreground transition-transform group-hover:translate-x-1 sm:block" /></Link>)}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_1.2fr] lg:px-10">
        <div className="border border-border bg-slab p-6 text-slab-foreground sm:p-8"><div className="mb-12 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-slab-foreground/60"><span>Player readiness</span><span>Season 01</span></div><div className="flex items-end justify-between gap-4"><div><p className="font-display text-6xl font-black tracking-[-0.07em]">0<span className="text-primary">%</span></p><p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slab-foreground/60">Profile complete</p></div><div className="flex size-16 items-center justify-center border border-primary text-primary"><Gamepad2 className="size-7" /></div></div><div className="mt-8 grid grid-cols-3 border-t border-slab-foreground/20 pt-4 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-slab-foreground/60"><span><strong className="block text-lg text-slab-foreground">0</strong>matches</span><span><strong className="block text-lg text-slab-foreground">0</strong>top 3s</span><span><strong className="block text-lg text-slab-foreground">0</strong>vouchers</span></div><Link href="/signup" className="mt-8 flex min-h-11 items-center justify-center gap-2 border border-slab-foreground/30 font-mono text-[10px] font-bold uppercase tracking-[0.14em] hover:bg-slab-foreground hover:text-slab">Build your profile <ArrowUpRight className="size-3.5" /></Link></div>
        <div id="how-it-works"><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">The Arena loop</p><h2 className="max-w-xl font-display text-4xl font-black tracking-[-0.06em] sm:text-5xl">Less scrolling.<br />More playing.</h2><div className="mt-8 grid gap-0 sm:grid-cols-2">{[{ icon: Swords, title: "Choose a room", copy: "Find an open Free Fire MAX tournament that fits your night." }, { icon: Zap, title: "Claim your slot", copy: "Create your player profile and register in under a minute." }, { icon: Trophy, title: "Play the room", copy: "Get room details before start, then show up and compete." }, { icon: Medal, title: "Take the result", copy: "Top three players receive direct voucher rewards." }].map((step, index) => { const Icon = step.icon; return <div key={step.title} className="border-t border-border py-5 sm:px-4 sm:first:pl-0 sm:[&:nth-child(odd)]:border-r"><div className="flex items-start gap-4"><span className="flex size-9 shrink-0 items-center justify-center bg-primary/10 text-primary"><Icon className="size-4" /></span><div><p className="font-mono text-[10px] text-muted-foreground">0{index + 1}</p><h3 className="mt-1 font-display text-xl font-bold tracking-[-0.03em]">{step.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{step.copy}</p></div></div></div> })}</div></div>
      </section>

      <footer className="border-t border-border bg-card px-4 py-7 sm:px-6 lg:px-10"><div className="mx-auto flex w-full max-w-[1440px] flex-col justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:flex-row"><span>Built for everyday players · Free entry, always.</span><span>Not affiliated with or endorsed by Garena.</span></div></footer>
    </main>
  );
}
