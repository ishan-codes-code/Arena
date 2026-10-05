"use client";

import * as React from "react";

import { Ellipsis, Pencil, Archive, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";

export function GameRowActions(): React.ReactElement {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger
          render={
            <Button variant="ghost" size="icon" className="size-8" aria-label="Actions">
              <Ellipsis className="size-4" />
            </Button>
          }
        />
        <MenubarPortal>
          <MenubarContent side="right" align="start" sideOffset={4}>
            <MenubarGroup>
              <MenubarItem
                nativeButton
                render={(props) => (
                  <button
                    type="button"
                    {...props}
                    className="group/item flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-disabled:opacity-50 data-disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                  >
                    <Pencil className="size-4" />
                    Edit
                  </button>
                )}
              />
              <MenubarItem
                nativeButton
                render={(props) => (
                  <button
                    type="button"
                    {...props}
                    className="group/item flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-disabled:opacity-50 data-disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                  >
                    <Archive className="size-4" />
                    Archive
                  </button>
                )}
              />
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarItem
              nativeButton
              render={(props) => (
                <button
                  type="button"
                  {...props}
                  className="group/item flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive outline-none select-none focus:bg-destructive/10 focus:text-destructive data-disabled:opacity-50 data-disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                >
                  <Trash2 className="size-4" />
                  Delete
                </button>
              )}
            />
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>
  );
}