import Link from "next/link";
import { Radar } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <main className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 mesh-background" />
      <div className="absolute inset-0 -z-10 grid-overlay opacity-10" />
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-6 md:px-8">
        <SiteHeader current="home" mode="marketing" />
        <section className="mt-20">
          <EmptyState
            icon={Radar}
            title="ページが見つかりません"
            description="指定されたページは現在の GrassScan MVP には含まれていません。"
            action={
              <Button asChild>
                <Link href="/dashboard">ダッシュボードへ</Link>
              </Button>
            }
          />
        </section>
      </div>
    </main>
  );
}
