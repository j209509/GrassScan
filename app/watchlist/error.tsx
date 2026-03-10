"use client";

import { SiteHeader } from "@/components/site-header";
import { RouteErrorCard } from "@/components/ui/route-error-card";

type WatchlistErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function WatchlistError({ reset }: WatchlistErrorProps) {
  return (
    <main className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 mesh-background" />
      <div className="absolute inset-0 -z-10 grid-overlay opacity-10" />
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-6 md:px-8">
        <SiteHeader current="watchlist" mode="app" />
        <section className="mt-14">
          <RouteErrorCard
            title="ウォッチリストを読み込めませんでした"
            description="再試行すると現在のローカルデモ状態を使ってページを再描画します。"
            reset={reset}
          />
        </section>
      </div>
    </main>
  );
}
