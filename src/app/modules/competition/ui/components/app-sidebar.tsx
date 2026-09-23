"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, LayoutDashboard, List, LogIn, Trophy, UserRound } from "lucide-react";

import { ThemeToggleButton } from "@/app/modules/theme/ui/components/skiper-ui/skiper26";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const primaryNavigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Tournaments", href: "/tournaments", icon: Trophy },
  { label: "Games", href: "/games", icon: Gamepad2 },
  { label: "Rankings", href: "/rankings", icon: List },
];

const accountNavigation = [
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Join Arena", href: "/join", icon: LogIn },
];

type NavigationItem = (typeof primaryNavigation)[number];

function NavigationGroup({ items, pathname }: { items: NavigationItem[]; pathname: string }) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              render={<Link href={item.href} aria-current={isActive ? "page" : undefined} />}
              isActive={isActive}
              tooltip={item.label}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function ArenaSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary font-display text-sm font-black text-sidebar-primary-foreground">
            A
          </span>
          <span className="font-display text-lg font-black tracking-tight text-sidebar-foreground group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            ARENA<span className="text-sidebar-primary">.</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Compete</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationGroup items={primaryNavigation} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationGroup items={accountNavigation} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between rounded-md border border-sidebar-border bg-sidebar-accent/40 p-2 group-data-[collapsible=icon]/sidebar-wrapper:justify-center group-data-[collapsible=icon]/sidebar-wrapper:border-0 group-data-[collapsible=icon]/sidebar-wrapper:bg-transparent">
          <div className="min-w-0 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            <p className="font-body text-[0.58rem] uppercase tracking-[0.16em] text-sidebar-foreground/50">Arena MVP</p>
            <p className="mt-1 truncate text-xs text-sidebar-foreground/75">Free entry, always.</p>
          </div>
          <ThemeToggleButton variant="circle" start="top-right" className="!size-8 !rounded-md !border-sidebar-border !bg-transparent !p-1 !shadow-none hover:!bg-sidebar-accent" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
