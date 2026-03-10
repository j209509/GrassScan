"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, ShieldCheck, TriangleAlert } from "lucide-react";
import { MarketStatusNotice } from "@/components/market/market-status-notice";
import { useMarketData } from "@/components/providers/market-data-provider";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactNumber } from "@/lib/market/formatters";
import type { ScanLog } from "@/lib/market/types";

const statusLabels = {
  success: "成功",
  warning: "警告",
  failed: "失敗",
} as const;

function getLastSuccessfulScan(logs: ScanLog[]) {
  return logs.find((log) => log.status === "success");
}

export function InternalScanClient() {
  const { loading, refresh, scanLogs, status } = useMarketData();
  const [logs, setLogs] = useState<ScanLog[]>(scanLogs);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setLogs(scanLogs);
  }, [scanLogs]);

  const lastSuccessfulScan = getLastSuccessfulScan(logs);
  const latestLog = logs[0] ?? {
    processedSymbols: 0,
    failedFetches: 0,
  };
  const failedFetches = logs.reduce((sum, log) => sum + log.failedFetches, 0);

  return (
    <main className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 mesh-background" />
      <div className="absolute inset-0 -z-10 grid-overlay opacity-10" />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 md:px-8">
        <SiteHeader current="internal" mode="app" />
        <div className="mt-4">
          <MarketStatusNotice />
        </div>

        <section className="mt-14 space-y-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary">
                内部スキャン画面
              </Badge>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                  スキャン運用
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                  現在のデータソースログを確認し、処理件数を見ながら、手動再取得 UI をローカルで試せます。
                </p>
              </div>
            </div>

            <Button
              type="button"
              disabled={running || loading}
              onClick={() => {
                setRunning(true);
                refresh();
                window.setTimeout(() => {
                  const completedAt = new Date().toISOString();
                  const startedAt = new Date(Date.now() - 1500).toISOString();
                  setLogs((current) => [
                    {
                      id: `scan-${current.length + 302}`,
                      source:
                        status.source === "live"
                          ? "手動ライブ再取得"
                          : "手動デモ再実行",
                      status: "success",
                      startedAt,
                      completedAt,
                      processedSymbols: current[0]?.processedSymbols ?? scanLogs[0]?.processedSymbols ?? 0,
                      failedFetches: 0,
                      note:
                        status.source === "live"
                          ? "ライブスナップショットを再評価しました。"
                          : "ローカルのデモスナップショットを再生成しました。",
                    },
                    ...current,
                  ]);
                  setRunning(false);
                }, 900);
              }}
            >
              <RefreshCcw className={running || loading ? "animate-spin" : ""} />
              {running || loading ? "実行中..." : "手動再実行"}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
              <CardContent className="space-y-2 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  直近成功スキャン
                </p>
                <p className="text-2xl font-semibold">
                  {lastSuccessfulScan?.completedAt ?? "保留中"}
                </p>
              </CardContent>
            </Card>
            <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
              <CardContent className="space-y-2 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  処理銘柄数
                </p>
                <p className="text-2xl font-semibold">
                  {formatCompactNumber(latestLog.processedSymbols)}
                </p>
              </CardContent>
            </Card>
            <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
              <CardContent className="space-y-2 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  失敗取得数
                </p>
                <p className="text-2xl font-semibold">{failedFetches}</p>
              </CardContent>
            </Card>
            <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
              <CardContent className="space-y-2 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  現在モード
                </p>
                <p className="text-2xl font-semibold">
                  {status.label}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl">スキャンログ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-[1.5rem] border border-border/60 bg-background/45 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {log.status === "success" ? (
                          <ShieldCheck className="size-4 text-primary" />
                        ) : (
                          <TriangleAlert className="size-4 text-amber-300" />
                        )}
                        <p className="font-medium">{log.id}</p>
                        <Badge
                          variant="secondary"
                          className="rounded-full bg-secondary/60"
                        >
                          {statusLabels[log.status]}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {log.note}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>ソース: {log.source}</p>
                      <p>開始: {log.startedAt}</p>
                      <p>完了: {log.completedAt}</p>
                      <p>処理: {log.processedSymbols}</p>
                      <p>失敗取得: {log.failedFetches}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
