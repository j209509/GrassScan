"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react";
import type { DemoSession } from "@/lib/market/types";

type DemoStateContextValue = {
  hydrated: boolean;
  demoMode: boolean;
  session: DemoSession | null;
  watchlist: string[];
  isWatchlisted: (symbol: string) => boolean;
  toggleWatchlist: (symbol: string) => void;
  setDemoMode: (next: boolean) => void;
  login: (email: string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;
};

const WATCHLIST_STORAGE_KEY = "grassscan.watchlist";
const DEMO_MODE_STORAGE_KEY = "grassscan.demoMode";
const SESSION_STORAGE_KEY = "grassscan.session";

const DemoStateContext = createContext<DemoStateContextValue | null>(null);

function createSession(name: string, email: string): DemoSession {
  return {
    name,
    email,
    tier: "無料",
    createdAt: "2026-03-10T09:00:00Z",
  };
}

export function DemoStateProvider({
  defaultDemoMode,
  children,
}: Readonly<{
  defaultDemoMode: boolean;
  children: React.ReactNode;
}>) {
  const [hydrated, setHydrated] = useState(false);
  const [demoMode, setDemoModeState] = useState(defaultDemoMode);
  const [session, setSession] = useState<DemoSession | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>(["BBAI", "QBTS", "TNYA"]);

  useEffect(() => {
    try {
      const storedWatchlist = window.localStorage.getItem(WATCHLIST_STORAGE_KEY);
      const storedDemoMode = window.localStorage.getItem(DEMO_MODE_STORAGE_KEY);
      const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

      if (storedWatchlist) {
        setWatchlist(JSON.parse(storedWatchlist) as string[]);
      }

      if (storedDemoMode) {
        setDemoModeState(storedDemoMode === "true");
      }

      if (storedSession) {
        setSession(JSON.parse(storedSession) as DemoSession);
      }
    } catch {
      // Ignore malformed local demo state and keep sensible defaults.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
  }, [hydrated, watchlist]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(DEMO_MODE_STORAGE_KEY, String(demoMode));
  }, [demoMode, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (session) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      return;
    }

    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }, [hydrated, session]);

  const value: DemoStateContextValue = {
    hydrated,
    demoMode,
    session,
    watchlist,
    isWatchlisted: (symbol) => watchlist.includes(symbol),
    toggleWatchlist: (symbol) => {
      startTransition(() => {
        setWatchlist((current) =>
          current.includes(symbol)
            ? current.filter((item) => item !== symbol)
            : [...current, symbol].sort(),
        );
      });
    },
    setDemoMode: (next) => {
      startTransition(() => {
        setDemoModeState(next);
      });
    },
    login: (email) => {
      const fallbackName = email.split("@")[0] || "デモユーザー";
      startTransition(() => {
        setSession(createSession(fallbackName, email));
      });
    },
    signup: (name, email) => {
      const safeName = name.trim() || email.split("@")[0] || "デモユーザー";
      startTransition(() => {
        setSession(createSession(safeName, email));
      });
    },
    logout: () => {
      startTransition(() => {
        setSession(null);
      });
    },
  };

  return (
    <DemoStateContext.Provider value={value}>
      {children}
    </DemoStateContext.Provider>
  );
}

export function useDemoState() {
  const context = useContext(DemoStateContext);

  if (!context) {
    throw new Error("useDemoState must be used within DemoStateProvider");
  }

  return context;
}
