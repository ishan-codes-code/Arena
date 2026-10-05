"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Archive, Ellipsis, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
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
} from "@/components/ui/dropdown-menu";
import type { Game } from "@/modules/games/queries/games";
import { useTRPC } from "@/trpc/client";

export function GameRowActions({
  game,
}: {
  game: Pick<Game, "id" | "name">;
}): React.ReactElement {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${game.name}`}
            >
              <Ellipsis aria-hidden="true" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Pencil aria-hidden="true" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Archive aria-hidden="true" />
              Archive
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
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
    </>
  );
}
