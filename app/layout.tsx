import type { Metadata, Viewport } from "next";

import "./globals.css";

import { AppShell } from "@/components/app-shell";
import { AppProvider } from "@/components/providers";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://meridian-journal.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Meridian — Trading Plan & Journal",
    template: "%s · Meridian",
  },
  description:
    "A calm, professional workspace for building trading plans, reviewing execution, and improving performance through evidence.",
  applicationName: "Meridian",
  keywords: [
    "trading journal",
    "trading plan",
    "risk management",
    "trade analytics",
  ],
  authors: [{ name: "Meridian" }],
  creator: "Meridian",
  openGraph: {
    type: "website",
    title: "Meridian — Trading Plan & Journal",
    description: "Build the plan. Trade the plan. Review the evidence.",
    siteName: "Meridian",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meridian — Trading Plan & Journal",
    description: "Build the plan. Trade the plan. Review the evidence.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08090D" },
    { media: "(prefers-color-scheme: light)", color: "#F5F6F8" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
