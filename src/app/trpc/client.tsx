"use client";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import type { AppRouter } from "./routers/_app";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

export function TRPCReactProvider(props: { children: React.ReactNode; queryClient: QueryClient }) {
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url: "/api/trpc" })],
    }),
  );

  return <TRPCProvider trpcClient={trpcClient} queryClient={props.queryClient}>{props.children}</TRPCProvider>;
}
