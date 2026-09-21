import { redirect } from "next/navigation";

import { LogoutButton } from "@/modules/auth/ui/components/logout-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  const email = typeof data.claims.email === "string" ? data.claims.email : "Arena player";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="grid w-full max-w-lg gap-6 border border-border bg-card p-6 shadow-[12px_12px_0_var(--border)] sm:p-8">
        <div className="grid gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Arena / Dashboard</p>
          <h1 className="font-display text-4xl font-black tracking-[-0.06em]">Hello!</h1>
          <p className="font-mono text-sm text-muted-foreground">{email}</p>
        </div>
        <LogoutButton />
      </section>
    </main>
  );
}