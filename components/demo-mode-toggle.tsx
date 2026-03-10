"use client";

import { MonitorCog } from "lucide-react";
import { useDemoState } from "@/components/providers/demo-state-provider";
import { cn } from "@/lib/utils";

export function DemoModeToggle() {
  const { demoMode, hydrated, setDemoMode } = useDemoState();

  return (
    <button
      type="button"
      onClick={() => setDemoMode(!demoMode)}
      className={cn(
        "flex items-center gap-3 rounded-full border px-4 py-2 text-left transition",
        demoMode
          ? "border-primary/25 bg-primary/10 text-primary"
          : "border-border/70 bg-background/60 text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-full border",
          demoMode
            ? "border-primary/25 bg-primary/10"
            : "border-border/70 bg-background/80",
        )}
      >
        <MonitorCog className="size-4" />
      </span>
      <span className="hidden sm:block">
        <span className="block text-[11px] uppercase tracking-[0.24em]">
          優先表示
        </span>
        <span className="block text-sm font-medium">
          {hydrated ? (demoMode ? "デモ優先" : "ライブ優先") : "読み込み中"}
        </span>
      </span>
    </button>
  );
}
