"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useDemoState } from "@/components/providers/demo-state-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";

export function LogoutPanel() {
  const router = useRouter();
  const { logout, session } = useDemoState();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 mesh-background" />
      <div className="absolute inset-0 grid-overlay opacity-15" />
      <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-6 md:px-8">
        <SiteHeader current="login" mode="marketing" />

        <div className="pt-20">
          <Card className="panel-glow border-border/70 bg-card/80 backdrop-blur-sm">
            <CardHeader className="items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10">
                <LogOut className="size-6 text-primary" />
              </div>
              <CardTitle className="mt-4 text-3xl">
                {session ? `${session.name} をログアウトしますか？` : "ローカルセッションを削除しました"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-sm leading-7 text-muted-foreground">
                ログアウトは現時点では UI のみです。ローカルのデモセッションを削除して、MVP の導線を初期状態から試し直せます。
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                >
                  ローカルセッションを削除
                </Button>
                <Button asChild type="button" variant="outline">
                  <Link href="/dashboard">ダッシュボードへ戻る</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
