"use client";

import { SiteHeader } from "@/components/site-header";
import { RouteErrorCard } from "@/components/ui/route-error-card";

type SymbolErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SymbolError({ reset }: SymbolErrorProps) {
  return (
    <main className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 mesh-background" />
      <div className="absolute inset-0 -z-10 grid-overlay opacity-10" />
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-6 md:px-8">
        <SiteHeader current="symbol" mode="app" />
        <section className="mt-14">
          <RouteErrorCard
            title="銘柄詳細を読み込めませんでした"
            description="再試行すると詳細ルートを再読込し、ローカルのモックスナップショットを再構築します。"
            reset={reset}
          />
        </section>
      </div>
    </main>
  );
}
