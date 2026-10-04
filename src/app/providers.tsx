"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { TRPCReactProvider } from "@/trpc/client"

/**
 * Create a stable QueryClient instance that persists across re-renders
 * By creating it outside the component, we ensure it's only instantiated once
 * This follows TanStack Query's recommended pattern for Next.js App Router
 */
export const queryClient = new QueryClient()

/**
 * Provider wrapper that includes Tanstack Query and Devtools
 * Wrap this around your application in the root layout
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {process.env.NODE_ENV === "development" ? (
        <>
          <TRPCReactProvider queryClient={queryClient}>
            {children}
          </TRPCReactProvider>
          <div style={{ position: "fixed", bottom: 0, right: 0 }}>
            <ReactQueryDevtools initialIsOpen={false} />
          </div>
        </>
      ) : (
        <TRPCReactProvider queryClient={queryClient}>{children}</TRPCReactProvider>
      )}
    </QueryClientProvider>
  )
}