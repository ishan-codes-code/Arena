"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { ArenaSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(pathname);

  if (isAuthRoute) {
    return children;
  }

  return (
    <SidebarProvider>
      <TooltipProvider>
        <ArenaSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar />
          {children}
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}