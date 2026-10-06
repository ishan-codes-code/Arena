"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  Ellipsis,
  Eye,
  LoaderCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AddGameForm } from "./add-game-form";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/animate-ui/primitives/base/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/primitives/radix/dropdown-menu";
import type { Game } from "@/modules/games/queries/games";
import { useTRPC } from "@/trpc/client";
import { useGameUpdateMutation } from "./game-update-mutation";

export function GameRowActions({
  game,
}: {
  game: Game;
}): React.ReactElement {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const updateMutation = useGameUpdateMutation();
  const deleteMutation = useMutation(
    trpc.games.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.games.list.queryKey(),
        });
        setIsDeleteDialogOpen(false);
        toast.success("Game deleted", {
          description: `${game.name} was removed from Arena.`,
        });
      },
      onError: (error) => {
        toast.error("Could not delete game", {
          description: error.message || "Please try again.",
        });
      },
    }),
  );
  const handleDelete = () => {
    if (deleteMutation.isPending) return;
    deleteMutation.mutate({ id: game.id });
  };

  const handleArchive = () => {
    if (updateMutation.isPending) return;
    updateMutation.mutate(
      { id: game.id, status: "archived" },
      {
        onSuccess: () => {
          setIsArchiveDialogOpen(false);
          toast.success("Game archived", {
            description: `${game.name} is now archived.`,
          });
        },
      },
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Actions for ${game.name}`}
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted"
        >
          <Ellipsis aria-hidden="true" className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={4}
          className="min-w-40 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled
              className="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground outline-none"
            >
              <Eye aria-hidden="true" className="size-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setIsEditFormOpen(true)}
              className="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
            >
              <Pencil aria-hidden="true" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="my-1 h-px bg-border" />
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled={
                game.status === "archived" || updateMutation.isPending
              }
              onSelect={() => setIsArchiveDialogOpen(true)}
              className="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
            >
              <Archive aria-hidden="true" />
              Archive
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="my-1 h-px bg-border" />
          <DropdownMenuItem
            onSelect={() => setIsDeleteDialogOpen(true)}
            className="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive outline-none data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
          >
            <Trash2 aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending) setIsDeleteDialogOpen(open);
        }}
      >
        <AlertDialogPortal>
          <AlertDialogBackdrop className="fixed inset-0 z-40 bg-black/50" />
          <AlertDialogPopup className="fixed inset-0 z-50 m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md flex-col gap-5 overflow-y-auto border border-border bg-card p-6 text-card-foreground shadow-lg outline-none">
            <AlertDialogHeader className="flex flex-col gap-2">
              <AlertDialogTitle className="font-display text-xl font-bold">
                Delete game?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
                <span className="break-words font-medium text-foreground">
                  {game.name}
                </span>{" "}
                will be permanently removed from Arena. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialogClose
                render={
                  <Button
                    type="button"
                    variant="outline"
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </Button>
                }
              />
              <Button
                type="button"
                variant="destructive"
                disabled={deleteMutation.isPending}
                aria-busy={deleteMutation.isPending}
                onClick={handleDelete}
              >
                {deleteMutation.isPending ? (
                  <LoaderCircle
                    aria-hidden="true"
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 aria-hidden="true" data-icon="inline-start" />
                )}
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialogPortal>
      </AlertDialog>
      <AlertDialog
        open={isArchiveDialogOpen}
        onOpenChange={(open) => {
          if (!updateMutation.isPending) setIsArchiveDialogOpen(open);
        }}
      >
        <AlertDialogPortal>
          <AlertDialogBackdrop className="fixed inset-0 z-40 bg-black/50" />
          <AlertDialogPopup className="fixed inset-0 z-50 m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md flex-col gap-5 overflow-y-auto border border-border bg-card p-6 text-card-foreground shadow-lg outline-none">
            <AlertDialogHeader className="flex flex-col gap-2">
              <AlertDialogTitle className="font-display text-xl font-bold">
                Archive game?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
                <span className="break-words font-medium text-foreground">
                  {game.name}
                </span>{" "}
                will be marked as archived. You can change its status later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialogClose
                render={
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                }
              />
              <Button
                type="button"
                variant="destructive"
                disabled={updateMutation.isPending}
                aria-busy={updateMutation.isPending}
                onClick={handleArchive}
              >
                {updateMutation.isPending && (
                  <LoaderCircle
                    aria-hidden="true"
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                )}
                {updateMutation.isPending ? "Archiving..." : "Archive"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialogPortal>
      </AlertDialog>
      {isEditFormOpen && (
        <AddGameForm
          mode="edit"
          game={game}
          open={isEditFormOpen}
          onOpenChange={setIsEditFormOpen}
          isPending={updateMutation.isPending}
          onEditSubmit={(values) => {
            if (updateMutation.isPending) return;
            updateMutation.mutate(values, {
              onSuccess: (updatedGame) => {
                setIsEditFormOpen(false);
                toast.success("Game updated", {
                  description: `${updatedGame.name} was updated.`,
                });
              },
            });
          }}
        />
      )}
    </>
  );
}
