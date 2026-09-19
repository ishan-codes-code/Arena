"use client";

import { Globe, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function OAuthButtons() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Button type="button" variant="outline" size="lg" className="h-11 rounded-xl font-mono text-[10px] uppercase tracking-[0.1em] sm:h-12" onClick={() => console.log("Google OAuth")}>
        <Globe />
        Continue with Google
      </Button>
      <Button type="button" variant="outline" size="lg" className="h-11 rounded-xl font-mono text-[10px] uppercase tracking-[0.1em] sm:h-12" onClick={() => console.log("Discord OAuth")}>
        <MessageCircle />
        Continue with Discord
      </Button>
    </div>
  );
}
