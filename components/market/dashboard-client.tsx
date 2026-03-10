"use client";

import Link from "next/link";
import {
  ArrowDownUp,
  Gauge,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { startTransition, useDeferredValue, useState } from "react";
import { ActivityScoreMeter } from "@/components/market/activity-score-meter";
import { MarketStatusNotice } from "@/components/market/market-status-notice";
import { MetricLineChart } from "@/components/market/metric-line-chart";
import { WatchlistToggle } from "@/components/market/watchlist-toggle";
import { WhyFlaggedPopover } from "@/components/market/why-flagged-popover";
import { useDemoState } from "@/components/providers/demo-state-provider";
import { useMarketData } from "@/components/providers/market-data-provider";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingPanel } from "@/components/ui/loading-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  defaultDashboardFilters,
  savedFilterPresets,
} from "@/lib/market/demo-data";
import {
  LIVE_DASHBOARD_RESULT_LIMIT,
  LIVE_UNIVERSE_SCAN_COUNT,
} from "@/lib/market/live-universe";
import {
  formatCompactNumber,
  formatCurrency,
  formatMarketCap,
  formatPercent,
} from "@/lib/market/formatters";
import {
  applyDashboardFilters,
  getEnrichedSymbolsFromUniverse,
  getTopMoverHighlightsFromUniverse,
  sortSymbols,
} from "@/lib/market/selectors";
import {
  MARKET_CAP_RANGES,
  SECTORS,
  type DashboardFilters,
  type SortDirection,
  type SortableField,
} from "@/lib/market/types";

const sortableColumns: Array<{
  key: SortableField;
  label: string;
}> = [
  { key: "symbol", label: "銘柄" },
  { key: "companyName", label: "企業名" },
  { key: "price", label: "価格" },
  { key: "dailyChangePct", label: "日次%" },
  { key: "volume", label: "出来高" },
  { key: "relativeVolume", label: "相対出来高" },
  { key: "marketCapMillions", label: "時価総額" },
  { key: "activityScore", label: "スコア" },
  { key: "flagsCount", label: "フラグ" },
] as const;

type DashboardTopCardProps = {
  label: string;
  symbol: string;
  value: string;
  note: string;
};

function DashboardTopCard({
  label,
  symbol,
  value,
  note,
}: DashboardTopCardProps) {
  return (
    <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
      <CardContent className="space-y-3 p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          {label}
        </p>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold">{symbol}</p>
            <p className="text-sm text-muted-foreground">{note}</p>
          </div>
          <p className="text-lg font-medium text-primary">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function hasActiveDashboardRefinements(
  filters: DashboardFilters,
  sortField: SortableField,
  sortDirection: SortDirection,
) {
  return (
    filters.query.trim().length > 0 ||
    filters.priceUnder.trim().length > 0 ||
    filters.minVolume.trim().length > 0 ||
    filters.sector !== defaultDashboardFilters.sector ||
    filters.marketCapRange !== defaultDashboardFilters.marketCapRange ||
    filters.activityScoreThreshold !== defaultDashboardFilters.activityScoreThreshold ||
    sortField !== "activityScore" ||
    sortDirection !== "desc"
  );
}

export function DashboardClient() {
  const { hydrated, watchlist } = useDemoState();
  const { loading, refresh, status, symbols } = useMarketData();
  const [filters, setFilters] = useState<DashboardFilters>(defaultDashboardFilters);
  const [sortField, setSortField] = useState<SortableField>("activityScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const deferredQuery = useDeferredValue(filters.query);
  const effectiveFilters = {
    ...filters,
    query: deferredQuery,
  };
  const rankedSymbols = getEnrichedSymbolsFromUniverse(symbols, watchlist);
  const topMovers = getTopMoverHighlightsFromUniverse(symbols, watchlist);
  const filteredSymbols = sortSymbols(
    applyDashboardFilters(rankedSymbols, effectiveFilters),
    sortField,
    sortDirection,
  );
  const discoveryMode =
    status.source === "live" &&
    !hasActiveDashboardRefinements(filters, sortField, sortDirection);
  const visibleSymbols = discoveryMode
    ? filteredSymbols.slice(0, LIVE_DASHBOARD_RESULT_LIMIT)
    : filteredSymbols;
  const visibleCountLabel = discoveryMode
    ? `上位 ${visibleSymbols.length} / ${LIVE_UNIVERSE_SCAN_COUNT} 件`
    : `${visibleSymbols.length}件`;
  const discoverySummary =
    status.source === "live"
      ? `厳選した小型株 ${LIVE_UNIVERSE_SCAN_COUNT} 銘柄を内部で走査し、いまスコア上位に浮上している銘柄だけを表示しています。`
      : "デモユニバースをランキングし、現在スコア上位の銘柄を表示しています。";

  function updateFilter<Key extends keyof DashboardFilters>(
    key: Key,
    value: DashboardFilters[Key],
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function applyPreset(values: Partial<DashboardFilters>) {
    startTransition(() => {
      setFilters({
        ...defaultDashboardFilters,
        ...values,
      });
    });
  }

  function toggleSorting(field: SortableField) {
    if (field === sortField) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }

    setSortField(field);
    setSortDirection("desc");
  }

  if (!hydrated || loading) {
    return (
      <main className="relative min-h-screen">
        <div className="absolute inset-0 -z-10 mesh-background" />
        <div className="absolute inset-0 -z-10 grid-overlay opacity-10" />
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 md:px-8">
          <SiteHeader current="dashboard" mode="app" />
          <section className="mt-14 space-y-6">
            <LoadingPanel />
            <LoadingPanel />
          </section>
        </div>
      </main>
    );
  }

  if (rankedSymbols.length === 0) {
    return (
      <main className="relative min-h-screen">
        <div className="absolute inset-0 -z-10 mesh-background" />
        <div className="absolute inset-0 -z-10 grid-overlay opacity-10" />
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 md:px-8">
          <SiteHeader current="dashboard" mode="app" />
          <section className="mt-14">
            <EmptyState
              icon={Gauge}
              title="銘柄データを取得できませんでした"
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
        <SiteHeader current="dashboard" mode="app" />
        <div className="mt-4">
          <MarketStatusNotice />
        </div>

        <section className="mt-14 space-y-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary">
                本日の検出シグナル
              </Badge>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                  小型株スキャンボード
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                  厳選した小型株ユニバースを内部で走査し、出来高・値動き・ボラティリティ・
                  モメンタムを合成したスコア上位だけを一覧化しています。
                </p>
              </div>
            </div>
            <div className="max-w-xl rounded-[1.75rem] border border-primary/15 bg-primary/10 px-5 py-4 text-sm leading-7 text-primary">
              <p>{status.message}</p>
              <p className="mt-2 text-primary/80">{discoverySummary}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardTopCard
              label="最高アクティビティ"
              symbol={topMovers.highestActivity.symbol}
              value={topMovers.highestActivity.activityScore.toFixed(1)}
              note={topMovers.highestActivity.companyName}
            />
            <DashboardTopCard
              label="最大相対出来高"
              symbol={topMovers.highestRelativeVolume.symbol}
              value={`${topMovers.highestRelativeVolume.relativeVolume.toFixed(1)}x`}
              note={topMovers.highestRelativeVolume.companyName}
            />
            <DashboardTopCard
              label="最大日次変動"
              symbol={topMovers.biggestDailyMove.symbol}
              value={formatPercent(topMovers.biggestDailyMove.dailyChangePct)}
              note={topMovers.biggestDailyMove.companyName}
            />
            <DashboardTopCard
              label="最多ウォッチ"
              symbol={topMovers.mostWatchlisted.symbol}
              value={formatCompactNumber(topMovers.mostWatchlisted.watchlistCount)}
              note={topMovers.mostWatchlisted.companyName}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {rankedSymbols.slice(0, 3).map((symbol) => (
              <Card
                key={symbol.symbol}
                className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm"
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        今日の上位検出
                      </p>
                      <CardTitle className="mt-2 text-2xl">
                        {symbol.symbol}
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className="rounded-full bg-secondary/60">
                      {symbol.sector}
                    </Badge>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {symbol.companyName}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <ActivityScoreMeter score={symbol.activityScore} />
                    <p className="text-sm text-primary">
                      {formatPercent(symbol.dailyChangePct)}
                    </p>
                  </div>
                  <MetricLineChart values={symbol.scoreHistory} className="p-3" />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/symbol/${symbol.symbol}`}>銘柄詳細</Link>
                    </Button>
                    <WatchlistToggle compact symbol={symbol.symbol} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
            <CardHeader className="space-y-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    フィルター
                  </p>
                  <CardTitle className="mt-2 text-3xl">
                    スキャン条件を絞り込む
                  </CardTitle>
                </div>
                <div className="flex flex-wrap gap-2">
                  {savedFilterPresets.map((preset) => (
                    <Button
                      key={preset.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset.values)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters(defaultDashboardFilters)}
                  >
                    <X className="size-4" />
                    クリア
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.4fr_repeat(5,minmax(0,1fr))]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={filters.query}
                    onChange={(event) => updateFilter("query", event.target.value)}
                    placeholder="ティッカー / 企業名を検索"
                    className="pl-11"
                  />
                </div>

                <Input
                  type="number"
                  value={filters.priceUnder}
                  onChange={(event) => updateFilter("priceUnder", event.target.value)}
                  placeholder="価格上限"
                />

                <Input
                  type="number"
                  value={filters.minVolume}
                  onChange={(event) => updateFilter("minVolume", event.target.value)}
                  placeholder="最低出来高"
                />

                <select
                  value={filters.sector}
                  onChange={(event) =>
                    updateFilter("sector", event.target.value as DashboardFilters["sector"])
                  }
                  className="flex h-12 w-full rounded-2xl border border-input bg-background/70 px-4 py-3 text-sm text-foreground outline-none"
                >
                  <option value="すべて">全セクター</option>
                  {SECTORS.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.marketCapRange}
                  onChange={(event) =>
                    updateFilter(
                      "marketCapRange",
                      event.target.value as DashboardFilters["marketCapRange"],
                    )
                  }
                  className="flex h-12 w-full rounded-2xl border border-input bg-background/70 px-4 py-3 text-sm text-foreground outline-none"
                >
                  {MARKET_CAP_RANGES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <Input
                  type="number"
                  value={filters.activityScoreThreshold}
                  onChange={(event) =>
                    updateFilter("activityScoreThreshold", event.target.value)
                  }
                  placeholder="最低スコア"
                />
              </div>
            </CardHeader>
          </Card>

          <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  ランキング結果
                </p>
                <CardTitle className="mt-2 text-3xl">
                  今日の上位シグナル
                </CardTitle>
              </div>
              <Badge variant="secondary" className="rounded-full bg-secondary/60">
                {visibleCountLabel}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
              {discoveryMode ? (
                <div className="px-6 pt-1 text-sm text-muted-foreground">
                  ライブ mode では厳選ユニバースを走査し、既定ではスコア上位のみ表示します。
                  検索・フィルター・並び替えを使うと対象結果を広げられます。
                </div>
              ) : null}

              {visibleSymbols.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={Sparkles}
                    title="条件に合う銘柄がありません"
                    description="スコア下限を下げるか、厳しめのフィルターを一つ外してみてください。"
                    action={
                      <Button
                        type="button"
                        onClick={() => setFilters(defaultDashboardFilters)}
                      >
                        フィルターをリセット
                      </Button>
                    }
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {sortableColumns.map((column) => (
                        <TableHead key={column.key}>
                          <button
                            type="button"
                            onClick={() => toggleSorting(column.key)}
                            className="inline-flex items-center gap-2 text-left"
                          >
                            {column.label}
                            <ArrowDownUp className="size-3.5 text-muted-foreground" />
                          </button>
                        </TableHead>
                      ))}
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleSymbols.map((symbol) => (
                      <TableRow key={symbol.symbol}>
                        <TableCell>
                          <Link
                            href={`/symbol/${symbol.symbol}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {symbol.symbol}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[15rem]">
                          <div>
                            <p>{symbol.companyName}</p>
                            <p className="text-xs text-muted-foreground">
                              {symbol.sector}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(symbol.price)}</TableCell>
                        <TableCell className="text-primary">
                          {formatPercent(symbol.dailyChangePct)}
                        </TableCell>
                        <TableCell>{formatCompactNumber(symbol.volume)}</TableCell>
                        <TableCell>{symbol.relativeVolume.toFixed(1)}x</TableCell>
                        <TableCell>{formatMarketCap(symbol.marketCapMillions)}</TableCell>
                        <TableCell>
                          <ActivityScoreMeter compact score={symbol.activityScore} />
                        </TableCell>
                        <TableCell>
                          <Badge className="rounded-full border-primary/20 bg-primary/10 text-primary">
                            {symbol.flagsCount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <WatchlistToggle compact symbol={symbol.symbol} />
                            <WhyFlaggedPopover symbol={symbol} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
