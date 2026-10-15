import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "./theme-provider";
import { AppShell } from "@/app/app-shell";
import { RouteTransition } from "@/components/route-transition";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const displayFont = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono-loaded",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Arena — Free mobile gaming tournaments",
  description: "Compete in free-entry mobile gaming tournaments across India.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <NextTopLoader
          color="#D7263D"
          height={2.5}
          showSpinner={false}
          crawl={true}
          crawlSpeed={200}
          initialPosition={0.08}
          easing="ease"
          speed={200}
          shadow="0 0 10px #D7263D,0 0 5px #D7263D"
        />
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <Toaster />
            <AppShell>
              <RouteTransition>
                {children}
              </RouteTransition>
            </AppShell>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
