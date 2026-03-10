"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useDemoState } from "@/components/providers/demo-state-provider";
import { createDemoMarketSnapshot } from "@/lib/market/snapshot";
import type { MarketDataSnapshot } from "@/lib/market/types";

type MarketDataContextValue = MarketDataSnapshot & {
  loading: boolean;
  refresh: () => void;
};

const MarketDataContext = createContext<MarketDataContextValue | null>(null);

function isAppRoute(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/watchlist") ||
    pathname.startsWith("/internal/scan") ||
    pathname.startsWith("/symbol/")
  );
}

function getMarketDataEndpoint(pathname: string) {
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/watchlist") ||
    pathname.startsWith("/internal/scan")
  ) {
    return "/api/market/overview?mode=auto";
  }

  if (pathname.startsWith("/symbol/")) {
    const symbol = pathname.split("/").filter(Boolean).at(1);

    if (!symbol) {
      return null;
    }

    return `/api/market/symbol/${encodeURIComponent(symbol)}?mode=auto`;
  }

  return null;
}

async function fetchMarketSnapshot(demoMode: boolean, pathname: string) {
  if (demoMode) {
    return createDemoMarketSnapshot({
      requestedMode: "demo",
    });
  }

  const endpoint = getMarketDataEndpoint(pathname);

  if (!endpoint) {
    return createDemoMarketSnapshot();
  }

  const response = await fetch(endpoint, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`市場データの取得に失敗しました (${response.status})。`);
  }

  return (await response.json()) as MarketDataSnapshot;
}

function createClientFallbackSnapshot(message: string) {
  return createDemoMarketSnapshot({
    requestedMode: "auto",
    configuredProvider: "twelve-data",
    usingFallback: true,
    message,
  });
}

export function MarketDataProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { demoMode, hydrated } = useDemoState();
  const [snapshot, setSnapshot] = useState<MarketDataSnapshot>(() =>
    createDemoMarketSnapshot(),
  );
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!hydrated || !isAppRoute(pathname)) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void fetchMarketSnapshot(demoMode, pathname)
      .then((nextSnapshot) => {
        if (cancelled) {
          return;
        }

        setSnapshot(nextSnapshot);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        const reason =
          error instanceof Error
            ? error.message
            : "市場データを読み込めませんでした。";

        setSnapshot(
          createClientFallbackSnapshot(
            `市場データの取得に失敗したため、デモデータを表示しています。${reason}`,
          ),
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [demoMode, hydrated, pathname, refreshKey]);

  const value: MarketDataContextValue = {
    ...snapshot,
    loading,
    refresh: () => {
      setRefreshKey((current) => current + 1);
    },
  };

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData() {
  const context = useContext(MarketDataContext);

  if (!context) {
    throw new Error("useMarketData must be used within MarketDataProvider");
  }

  return context;
}
