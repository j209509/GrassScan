import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { DemoStateProvider } from "@/components/providers/demo-state-provider";
import { MarketDataProvider } from "@/components/providers/market-data-provider";
import { getDefaultDemoMode } from "@/lib/market/config";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "GrassScan",
  description:
    "GrassScan は、Next.js 15 で構築したダークテーマの小型株スキャン用デモダッシュボードです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const defaultDemoMode = getDefaultDemoMode();

  return (
    <html
      lang="ja"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} dark`}
      suppressHydrationWarning
    >
      <body>
        <DemoStateProvider defaultDemoMode={defaultDemoMode}>
          <MarketDataProvider>{children}</MarketDataProvider>
        </DemoStateProvider>
      </body>
    </html>
  );
}
