"use client";

import Link from "next/link";
import { DataSourceIndicator } from "@/components/market/data-source-indicator";
import { BrandMark } from "@/components/brand-mark";
import { DemoModeToggle } from "@/components/demo-mode-toggle";
import { useDemoState } from "@/components/providers/demo-state-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  current:
    | "home"
    | "login"
    | "signup"
    | "dashboard"
    | "watchlist"
    | "internal"
    | "symbol";
  mode?: "marketing" | "app";
};

const marketingLinks = [
  { key: "home", label: "ホーム", href: "/" },
  { key: "login", label: "ログイン", href: "/login" },
  { key: "signup", label: "新規登録", href: "/signup" },
] as const;

const appLinks = [
  { key: "dashboard", label: "ダッシュボード", href: "/dashboard" },
  { key: "watchlist", label: "ウォッチリスト", href: "/watchlist" },
  { key: "internal", label: "スキャン運用", href: "/internal/scan" },
] as const;

export function SiteHeader({
  current,
  mode = "marketing",
}: SiteHeaderProps) {
  const { hydrated, session, watchlist } = useDemoState();
  const links = mode === "app" ? appLinks : marketingLinks;

  return (
    <header className="panel-glow flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-border/70 bg-background/65 px-4 py-3 backdrop-blur-xl md:px-6">
      <BrandMark />

      <nav className="hidden items-center gap-2 md:flex">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground",
              current === link.key && "bg-secondary text-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
        {mode === "marketing" ? (
          <>
            <Link
              href="/#how-it-works"
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              仕組み
            </Link>
            <Link
              href="/#pricing"
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              料金
            </Link>
          </>
        ) : null}
      </nav>

      <div className="flex items-center gap-3">
        {mode === "app" ? <DemoModeToggle /> : null}
        {mode === "app" ? <DataSourceIndicator /> : null}

        <Badge
          variant="secondary"
          className="hidden rounded-full bg-secondary/60 px-3 py-1.5 sm:inline-flex"
        >
          {hydrated && session ? `${session.name} ・ ${session.tier}` : `${watchlist.length}銘柄を監視中`}
        </Badge>

        {mode === "app" ? (
          session ? (
            <Button asChild size="sm" variant="outline">
              <Link href="/logout">ログアウト</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">ログイン</Link>
            </Button>
          )
        ) : (
          <>
            <Button asChild size="sm" variant="outline">
              <Link href={session ? "/dashboard" : "/login"}>
                {session ? "アプリを開く" : "ログイン"}
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href={session ? "/dashboard" : "/signup"}>
                {session ? "デモを見る" : "無料で始める"}
              </Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
