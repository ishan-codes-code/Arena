import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "@/components/ui/skiper-ui/skiper26";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between border-b border-border px-6 py-5 lg:px-10">
        <div className="font-display text-xl font-black tracking-tight">ARENA<span className="text-primary">.</span></div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a className="hidden transition-colors hover:text-foreground sm:block" href="#how-it-works">How it works</a>
          <a className="transition-colors hover:text-foreground" href="#tournaments">Tournaments</a>
          <ThemeToggleButton
            variant="circle"
            start="top-right"
            className="!size-8 !rounded-none !border !border-border !bg-background !p-1 !shadow-none hover:!bg-muted"
          />
        </div>
      </nav>

      <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.25fr_0.75fr] lg:px-10 lg:pb-28 lg:pt-24">
        <div className="flex flex-col justify-between gap-12">
          <div>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-primary">Free entry / India / mobile first</p>
            <h1 className="max-w-4xl font-display text-6xl font-black leading-[0.9] tracking-tight sm:text-8xl lg:text-[9rem]">
              PLAY<br /><span className="text-primary">FOR KEEPS.</span>
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-7 text-muted-foreground">
              Structured competition for the games you already play. Join a room, show your skill, and win direct vouchers.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg">Browse tournaments <ArrowUpRight /></Button>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">No entry fees. Ever.</span>
          </div>
        </div>

        <div id="tournaments" className="border border-border bg-card p-5 sm:p-7">
          <div className="flex items-center justify-between border-b border-border pb-5">
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">Next up</span>
            <span className="font-mono text-xs text-primary">01 / 12</span>
          </div>
          <div className="py-12">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-chart-1">Open for registration</p>
            <h2 className="font-display text-4xl font-bold leading-none">Free Fire MAX<br />Clash Squad</h2>
            <div className="mt-10 grid grid-cols-2 border-t border-border pt-5 font-mono text-xs uppercase">
              <div><span className="block text-muted-foreground">Starts</span><span className="mt-2 block text-sm text-foreground">Tonight / 9:00 PM</span></div>
              <div><span className="block text-muted-foreground">Prize pool</span><span className="mt-2 block text-sm text-foreground">Vouchers / top 3</span></div>
            </div>
          </div>
          <Button variant="outline" className="w-full">View tournament <ArrowUpRight /></Button>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-border bg-secondary/30">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {["Create your profile", "Find your match", "Play the room", "Claim your reward"].map((step, index) => (
              <div key={step} className="border-l border-border pl-4">
                <span className="font-mono text-xs text-primary">0{index + 1}</span>
                <p className="mt-5 font-display text-lg font-bold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <span className="font-mono uppercase tracking-wider">Built for everyday players</span>
        <span>Theme animation by Skiper UI. Not affiliated with or endorsed by Garena.</span>
      </footer>
    </main>
  );
}
