"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useDemoState } from "@/components/providers/demo-state-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const { login } = useDemoState();
  const [email, setEmail] = useState("demo@grassscan.io");

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        login(email);
        router.push("/dashboard");
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="login-email">メールアドレス</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">パスワード</Label>
        <Input id="login-password" type="password" defaultValue="grassscan-demo" />
      </div>
      <div className="rounded-[1.5rem] border border-primary/15 bg-primary/10 p-4">
        <p className="text-sm leading-7 text-primary">
          このフォームはローカルストレージにデモセッションを書き込むだけです。認証情報はまだ外部へ送信されません。
        </p>
      </div>
      <Button type="submit" className="w-full" size="lg">
        デモにログイン
        <ArrowRight />
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        アカウント UI が必要ですか？{" "}
        <Link href="/signup" className="text-primary hover:text-primary/80">
          ローカルで作成する
        </Link>
      </p>
    </form>
  );
}
