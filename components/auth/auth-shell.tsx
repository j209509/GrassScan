import { ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AuthShellProps = {
  current: "login" | "signup";
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

const highlights = [
  {
    icon: Workflow,
    title: "ローカル完結の認証フロー",
    description: "バックエンドなしで軽量なデモセッションを作成できます。",
  },
  {
    icon: ShieldCheck,
    title: "将来の本番認証に対応",
    description: "今の構成は意図的に小さく保ち、あとから認証基盤へきれいに差し替えられます。",
  },
  {
    icon: Sparkles,
    title: "すぐにプロダクトへ",
    description: "デモモードのまま、新規登録からダッシュボードへ直接進めます。",
  },
] as const;

export function AuthShell({
  current,
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 mesh-background" />
      <div className="absolute inset-0 grid-overlay opacity-15" />
      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-6 md:px-8">
        <SiteHeader current={current} mode="marketing" />

        <section className="grid gap-12 pt-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.24em] text-primary">
                {eyebrow}
              </p>
              <div className="space-y-4">
                <h1 className="text-5xl font-semibold tracking-tight text-balance md:text-6xl">
                  {title}
                </h1>
                <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="panel-glow flex gap-4 rounded-[1.75rem] border border-border/70 bg-card/70 p-5 backdrop-blur-sm"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                    <item.icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm leading-7 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="panel-glow border-border/70 bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                デモセッション
              </p>
              <CardTitle className="text-3xl">ローカル認証 UI</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
