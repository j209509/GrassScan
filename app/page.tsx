import Link from "next/link";
import { ArrowRight, Radar, ShieldCheck, Sparkles } from "lucide-react";
import { ActivityScoreMeter } from "@/components/market/activity-score-meter";
import { FlagPill } from "@/components/market/flag-pill";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  howItWorksSteps,
  landingStats,
  marketingFeatures,
  pricingTiers,
} from "@/lib/market/demo-data";
import {
  formatCompactNumber,
  formatCurrency,
  formatPercent,
} from "@/lib/market/formatters";
import { getEnrichedSymbols } from "@/lib/market/selectors";

const heroCards = [
  {
    icon: Radar,
    title: "初動の異常検知",
    description: "出来高が明確に積み上がる前の違和感を素早く拾います。",
  },
  {
    icon: ShieldCheck,
    title: "落ち着いて見られる運用画面",
    description: "フラグ、スコア要因、履歴を一つの上質な画面で確認できます。",
  },
  {
    icon: Sparkles,
    title: "今日から使えるデモ",
    description: "モックデータとローカル保存で、初日から一通りの流れを試せます。",
  },
] as const;

export default function Home() {
  const rankedSymbols = getEnrichedSymbols().slice(0, 6);

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 mesh-background" />
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-6 md:px-8">
        <SiteHeader current="home" mode="marketing" />

        <section className="grid gap-14 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-5">
              <Badge className="rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary">
                プレミアム小型株スキャナー
              </Badge>
              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance md:text-7xl">
                  群衆が気づく前に、小型株の異常な動きを捉える。
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                  GrassScan は、高シグナルなレビュー、ウォッチ管理、
                  異常アクティビティ監視をデモデータだけで完結できる
                  市場インテリジェンス MVP です。
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signup">
                  無料で始める
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard">デモを見る</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {landingStats.map((stat) => (
                <Card
                  key={stat.label}
                  className="panel-glow border-border/70 bg-card/75 backdrop-blur-sm"
                >
                  <CardContent className="space-y-2 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-semibold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.note}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="panel-glow overflow-hidden border-border/70 bg-card/80 backdrop-blur-sm">
            <CardHeader className="border-b border-border/60">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    サンプル上位銘柄
                  </p>
                  <CardTitle className="mt-2 text-2xl">
                    本日の異常アクティビティ上位
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="rounded-full bg-secondary/60">
                  デモデータ
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {rankedSymbols.slice(0, 4).map((symbol) => (
                <div
                  key={symbol.symbol}
                  className="rounded-[1.5rem] border border-border/60 bg-background/45 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{symbol.symbol}</p>
                      <p className="text-sm text-muted-foreground">
                        {symbol.companyName}
                      </p>
                    </div>
                    <ActivityScoreMeter compact score={symbol.activityScore} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-primary">
                      {formatPercent(symbol.dailyChangePct)} ・{" "}
                      {symbol.relativeVolume.toFixed(1)}x 相対出来高
                    </p>
                    <div className="flex gap-2">
                      {symbol.flags.slice(0, 2).map((flag) => (
                        <FlagPill key={flag} flag={flag} className="px-2.5" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {heroCards.map((item) => (
            <Card
              key={item.title}
              className="panel-glow border-border/70 bg-card/70 backdrop-blur-sm"
            >
              <CardContent className="space-y-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <item.icon className="size-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section id="how-it-works" className="mt-20 space-y-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-primary">
              仕組み
            </p>
            <h2 className="text-4xl font-semibold tracking-tight">
              スキャンから判断まで、流れはシンプルです。
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {howItWorksSteps.map((step, index) => (
              <Card
                key={step.title}
                className="panel-glow border-border/70 bg-card/70 backdrop-blur-sm"
              >
                <CardContent className="space-y-4 p-6">
                  <p className="text-sm font-mono text-primary">0{index + 1}</p>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="features" className="mt-20 space-y-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-primary">
              機能
            </p>
            <h2 className="text-4xl font-semibold tracking-tight">
              速く読めて、次の判断につながる設計です。
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {marketingFeatures.map((feature) => (
              <Card
                key={feature.title}
                className="panel-glow border-border/70 bg-card/70 backdrop-blur-sm"
              >
                <CardContent className="space-y-3 p-6">
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-20 space-y-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-primary">
              サンプル上位銘柄
            </p>
            <h2 className="text-4xl font-semibold tracking-tight">
              デモモードで上位に来る銘柄イメージです。
            </h2>
          </div>
          <Card className="panel-glow border-border/70 bg-card/70 backdrop-blur-sm">
            <CardContent className="space-y-4 p-6">
              {rankedSymbols.map((symbol) => (
                <div
                  key={symbol.symbol}
                  className="grid gap-4 rounded-[1.5rem] border border-border/60 bg-background/45 p-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]"
                >
                  <div>
                    <p className="font-medium">{symbol.symbol}</p>
                    <p className="text-sm text-muted-foreground">
                      {symbol.companyName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      価格
                    </p>
                    <p className="mt-1 font-medium">{formatCurrency(symbol.price)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      騰落
                    </p>
                    <p className="mt-1 font-medium text-primary">
                      {formatPercent(symbol.dailyChangePct)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      スコア
                    </p>
                    <ActivityScoreMeter compact score={symbol.activityScore} />
                    <p className="text-xs text-muted-foreground">
                      {formatCompactNumber(symbol.volume)} 出来高
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section id="pricing" className="mt-20 space-y-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-primary">
              料金
            </p>
            <h2 className="text-4xl font-semibold tracking-tight">
              まずはデモで始め、あとから実運用へ広げられます。
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className="panel-glow border-border/70 bg-card/70 backdrop-blur-sm"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    {tier.highlighted ? (
                      <Badge className="rounded-full border-primary/20 bg-primary/10 text-primary">
                        おすすめ
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-4xl font-semibold">{tier.price}</p>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {tier.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    {tier.features.map((feature) => (
                      <p key={feature} className="text-sm text-muted-foreground">
                        {feature}
                      </p>
                    ))}
                  </div>
                  <Button
                    asChild
                    className="w-full"
                    variant={tier.highlighted ? "default" : "outline"}
                  >
                    <Link href={tier.price === "$0" ? "/signup" : "/dashboard"}>
                      {tier.cta}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
