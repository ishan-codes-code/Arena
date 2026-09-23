"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { signOut } from "@/modules/auth/lib/auth-client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    const { error } = await signOut();

    if (error) {
      setIsSigningOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" onClick={handleLogout} disabled={isSigningOut}>
      {isSigningOut ? "Logging out..." : "Log out"}
    </Button>
  );
}