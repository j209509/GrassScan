"use client";

import { SiteHeader } from "@/components/site-header";
import { RouteErrorCard } from "@/components/ui/route-error-card";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ reset }: DashboardErrorProps) {
  return (
    <main className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 mesh-background" />
      <div className="absolute inset-0 -z-10 grid-overlay opacity-10" />
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-6 md:px-8">
        <SiteHeader current="dashboard" mode="app" />
        <section className="mt-14">
          <RouteErrorCard
            title="ダッシュボードを読み込めませんでした"
            description="スキャン画面の描画中に予期しない問題が発生しました。再試行でこのルートを再読込します。"
            reset={reset}
          />
        </section>
      </div>
    </main>
  );
}
