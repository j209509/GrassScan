"use client";

import Link from "next/link";
import { Bookmark, ListChecks } from "lucide-react";
import { ActivityScoreMeter } from "@/components/market/activity-score-meter";
import { MarketStatusNotice } from "@/components/market/market-status-notice";
import { MetricLineChart } from "@/components/market/metric-line-chart";
import { WatchlistToggle } from "@/components/market/watchlist-toggle";
import { useMarketData } from "@/components/providers/market-data-provider";
import { useDemoState } from "@/components/providers/demo-state-provider";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { baseSymbolUniverse } from "@/lib/market/demo-data";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { formatCurrency, formatPercent } from "@/lib/market/formatters";
import { getEnrichedSymbolsFromUniverse } from "@/lib/market/selectors";

export function WatchlistPageClient() {
  const { hydrated, watchlist } = useDemoState();
  const { loading, refresh, status, symbols } = useMarketData();
  const missingWatchlistSymbols = baseSymbolUniverse.filter(
    (symbol) =>
      watchlist.includes(symbol.symbol) &&
      !symbols.some((entry) => entry.symbol === symbol.symbol),
  );
  const mergedUniverse = [...symbols, ...missingWatchlistSymbols];
  const watchedSymbols = getEnrichedSymbolsFromUniverse(mergedUniverse, watchlist).filter(
    (symbol) => watchlist.includes(symbol.symbol),
  );

  if (!hydrated || loading) {
    return (
      <main className="relative min-h-screen">
        <div className="absolute inset-0 -z-10 mesh-background" />
        <div className="absolute inset-0 -z-10 grid-overlay opacity-10" />
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 md:px-8">
          <SiteHeader current="watchlist" mode="app" />
          <section className="mt-14">
            <LoadingPanel />
          </section>
        </div>
      </main>
    );
  }

  if (symbols.length === 0) {
    return (
      <main className="relative min-h-screen">
        <div className="absolute inset-0 -z-10 mesh-background" />
        <div className="absolute inset-0 -z-10 grid-overlay opacity-10" />
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 md:px-8">
          <SiteHeader current="watchlist" mode="app" />
          <section className="mt-14">
            <EmptyState
              icon={Bookmark}
              title="ウォッチリストを読み込めませんでした"
              description={status.message}
              action={
                <Button type="button" onClick={refresh}>
                  再読み込み
                </Button>
              }
            />
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 mesh-background" />
      <div className="absolute inset-0 -z-10 grid-overlay opacity-10" />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 md:px-8">
        <SiteHeader current="watchlist" mode="app" />
        <div className="mt-4">
          <MarketStatusNotice />
        </div>

        <section className="mt-14 space-y-8">
          <div className="space-y-3">
            <Badge className="rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary">
              ウォッチリスト
            </Badge>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                保存済み銘柄
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                もう一度見たい銘柄を保存し、最新スコア、騰落、短期推移をひと目で確認できます。
              </p>
            </div>
          </div>

          {watchedSymbols.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="ウォッチ銘柄はまだありません"
              description="ダッシュボードや詳細画面から銘柄を追加すると、最新スコア付きでここに表示されます。"
              action={
                <Button asChild>
                  <Link href="/dashboard">ランキングを見る</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {watchedSymbols.map((symbol) => (
                <Card
                  key={symbol.symbol}
                  className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm"
                >
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        {symbol.sector}
                      </p>
                      <CardTitle className="mt-2 text-2xl">
                        {symbol.symbol}
                      </CardTitle>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {symbol.companyName}
                      </p>
                    </div>
                    <WatchlistToggle symbol={symbol.symbol} />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">現在値</p>
                        <p className="text-2xl font-semibold">
                          {formatCurrency(symbol.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">本日</p>
                        <p className="text-lg font-medium text-primary">
                          {formatPercent(symbol.dailyChangePct)}
                        </p>
                      </div>
                    </div>
                    <ActivityScoreMeter score={symbol.activityScore} />
                    <MetricLineChart values={symbol.scoreHistory} />
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        最新ウォッチスコア
                      </p>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/symbol/${symbol.symbol}`}>詳細を開く</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
