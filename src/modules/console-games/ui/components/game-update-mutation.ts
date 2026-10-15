"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";

export function useGameUpdateMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.games.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.games.list.queryKey(),
        });
      },
      onError: (error) => {
        const message =
          error.data?.code === "NOT_FOUND"
            ? "This game is no longer available. Refresh the games list and try again."
            : error.data?.code === "CONFLICT"
              ? "That slug is already in use. Choose a different game name."
              : error.data?.code === "UNAUTHORIZED"
                ? "You must be an admin to edit games."
                : error.data?.code === "FORBIDDEN"
                  ? "You don't have permission to edit games."
                  : "We couldn't save the game changes. Please try again.";
        const title =
          error.data?.code === "NOT_FOUND"
            ? "Game not found"
            : error.data?.code === "CONFLICT"
              ? "Slug already in use"
              : "Failed to update game";

        toast.error(title, { description: message });
      },
    }),
  );
}
