"use client";

import { Globe, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function OAuthButtons() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button type="button" variant="outline" size="lg" className="h-10" onClick={() => console.log("Google OAuth")}>
        <Globe />
        Continue with Google
      </Button>
      <Button type="button" variant="outline" size="lg" className="h-10" onClick={() => console.log("Discord OAuth")}>
        <MessageCircle />
        Continue with Discord
      </Button>
    </div>
  );
}