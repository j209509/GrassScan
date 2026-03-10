"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, LineChart, Radar } from "lucide-react";
import { ActivityScoreMeter } from "@/components/market/activity-score-meter";
import { FlagPill } from "@/components/market/flag-pill";
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
  formatCompactNumber,
  formatCurrency,
  formatPercent,
} from "@/lib/market/formatters";
import { getEnrichedSymbolFromUniverse } from "@/lib/market/selectors";

type SymbolDetailClientProps = {
  symbol: string;
};

export function SymbolDetailClient({ symbol }: SymbolDetailClientProps) {
  const { hydrated, watchlist } = useDemoState();
  const { loading, refresh, status, symbols } = useMarketData();
  const detail = getEnrichedSymbolFromUniverse(symbols, symbol, watchlist);

  if (!hydrated || loading) {
    return (
      <main className="relative min-h-screen">
        <div className="absolute inset-0 -z-10 mesh-background" />
        <div className="absolute inset-0 -z-10 grid-overlay opacity-10" />
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 md:px-8">
          <SiteHeader current="symbol" mode="app" />
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
          <SiteHeader current="symbol" mode="app" />
          <section className="mt-14">
            <EmptyState
              icon={Radar}
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

  if (!detail) {
    return (
      <main className="relative min-h-screen">
        <div className="absolute inset-0 -z-10 mesh-background" />
        <div className="absolute inset-0 -z-10 grid-overlay opacity-10" />
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 md:px-8">
          <SiteHeader current="symbol" mode="app" />
          <section className="mt-14">
            <EmptyState
              icon={Radar}
              title="銘柄が見つかりません"
              description="この銘柄は現在のモックユニバースに含まれていません。"
              action={
                <Button asChild>
                  <Link href="/dashboard">ダッシュボードへ戻る</Link>
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
        <SiteHeader current="symbol" mode="app" />
        <div className="mt-4">
          <MarketStatusNotice />
        </div>

        <section className="mt-14 space-y-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Button asChild type="button" variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="size-4" />
                  ダッシュボードへ戻る
                </Link>
              </Button>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary">
                    {detail.sector}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full bg-secondary/60">
                    {detail.exchange}
                  </Badge>
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                  {detail.symbol}
                </h1>
                <p className="mt-2 text-lg leading-8 text-muted-foreground">
                  {detail.companyName}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <WatchlistToggle symbol={detail.symbol} />
              <Button asChild type="button" variant="outline">
                <Link href="/watchlist">ウォッチリストを開く</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
              <CardContent className="space-y-2 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  価格サマリー
                </p>
                <p className="text-3xl font-semibold">
                  {formatCurrency(detail.price)}
                </p>
                <p className="text-sm text-primary">
                  本日 {formatPercent(detail.dailyChangePct)}
                </p>
              </CardContent>
            </Card>
            <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
              <CardContent className="space-y-2 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  出来高
                </p>
                <p className="text-3xl font-semibold">
                  {formatCompactNumber(detail.volume)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {detail.relativeVolume.toFixed(1)}x 相対出来高
                </p>
              </CardContent>
            </Card>
            <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
              <CardContent className="space-y-2 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  アクティビティスコア
                </p>
                <ActivityScoreMeter score={detail.activityScore} />
                <p className="text-sm text-muted-foreground">
                  {detail.flagsCount}件のフラグ
                </p>
              </CardContent>
            </Card>
            <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
              <CardContent className="space-y-2 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  前日終値
                </p>
                <p className="text-3xl font-semibold">
                  {formatCurrency(detail.priceSummary.previousClose)}
                </p>
                <p className="text-sm text-muted-foreground">
                  寄り付き {formatCurrency(detail.priceSummary.open)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
            <div className="space-y-6">
              <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
                <CardHeader>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    中立AI要約
                  </p>
                  <CardTitle className="mt-2 text-2xl">
                    この銘柄が検知されている理由
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-8 text-muted-foreground">
                    {detail.aiSummary}
                  </p>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        7日スコア推移
                      </p>
                      <CardTitle className="mt-2 text-2xl">
                        直近アクティビティ推移
                      </CardTitle>
                    </div>
                    <Radar className="size-5 text-primary" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <MetricLineChart values={detail.scoreHistory} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>7営業日前</span>
                      <span>本日</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        ミニチャート（仮）
                      </p>
                      <CardTitle className="mt-2 text-2xl">
                        価格スナップショット
                      </CardTitle>
                    </div>
                    <LineChart className="size-5 text-primary" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <MetricLineChart values={detail.priceHistory} />
                    <p className="text-sm leading-7 text-muted-foreground">
                      {status.source === "live"
                        ? "7日価格推移には Twelve Data の日足を使用しています。あとから本格的なチャートコンポーネントへ差し替え可能です。"
                        : "この仮チャートはローカルのデモ履歴を使っています。あとから実データのチャートコンポーネントへ差し替え可能です。"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      最近のスキャン履歴
                    </p>
                    <CardTitle className="mt-2 text-2xl">
                      直近スキャン一覧
                    </CardTitle>
                  </div>
                  <BarChart3 className="size-5 text-primary" />
                </CardHeader>
                <CardContent className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-background/45 p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>時刻</TableHead>
                        <TableHead>スコア</TableHead>
                        <TableHead>日次%</TableHead>
                        <TableHead>出来高</TableHead>
                        <TableHead>相対出来高</TableHead>
                        <TableHead>注記</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.recentScans.map((scan) => (
                        <TableRow key={scan.scannedAt}>
                          <TableCell>{scan.scannedAt}</TableCell>
                          <TableCell>{scan.activityScore.toFixed(1)}</TableCell>
                          <TableCell className="text-primary">
                            {formatPercent(scan.dailyChangePct)}
                          </TableCell>
                          <TableCell>{formatCompactNumber(scan.volume)}</TableCell>
                          <TableCell>{scan.relativeVolume.toFixed(1)}x</TableCell>
                          <TableCell className="max-w-[18rem] text-sm text-muted-foreground">
                            {scan.note}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
                <CardHeader>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    発火中のフラグ
                  </p>
                  <CardTitle className="mt-2 text-2xl">
                    現在のフラグ構成
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {detail.flags.map((flag) => (
                    <FlagPill key={flag} flag={flag} />
                  ))}
                </CardContent>
              </Card>

              <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
                <CardHeader>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    前日比比較
                  </p>
                  <CardTitle className="mt-2 text-2xl">前日との比較</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">価格</span>
                    <span className="font-medium">
                      {formatCurrency(detail.previousDay.close)} → {formatCurrency(detail.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">出来高</span>
                    <span className="font-medium">
                      {formatCompactNumber(detail.previousDay.volume)} → {formatCompactNumber(detail.volume)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">相対出来高</span>
                    <span className="font-medium">
                      {detail.previousDay.relativeVolume.toFixed(1)}x → {detail.relativeVolume.toFixed(1)}x
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      アクティビティスコア
                    </span>
                    <span className="font-medium text-primary">
                      {detail.previousDay.activityScore.toFixed(1)} → {detail.activityScore.toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
                <CardHeader>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    スコア内訳
                  </p>
                  <CardTitle className="mt-2 text-2xl">スコア構成要素</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.values(detail.scoreBreakdown).map((component) => (
                    <div key={component.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{component.label}</span>
                        <span className="font-mono text-primary">
                          {component.contribution.toFixed(1)} 点
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${component.normalized}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        入力値: {component.raw}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
