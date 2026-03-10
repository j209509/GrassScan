"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useDemoState } from "@/components/providers/demo-state-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const router = useRouter();
  const { signup } = useDemoState();
  const [name, setName] = useState("Small Cap Operator");
  const [email, setEmail] = useState("operator@grassscan.io");

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        signup(name, email);
        router.push("/dashboard");
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="signup-name">名前</Label>
        <Input
          id="signup-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">メールアドレス</Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">パスワード</Label>
        <Input id="signup-password" type="password" defaultValue="grassscan-demo" />
      </div>
      <div className="rounded-[1.5rem] border border-primary/15 bg-primary/10 p-4">
        <p className="text-sm leading-7 text-primary">
          新規登録は現時点ではローカルで擬似的に処理されます。本番の認証基盤をつなぐ前に、導線を確認するための UI です。
        </p>
      </div>
      <Button type="submit" className="w-full" size="lg">
        無料で始める
        <ArrowRight />
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        すぐに試しますか？{" "}
        <Link href="/login" className="text-primary hover:text-primary/80">
          ログインへ
        </Link>
      </p>
    </form>
  );
}
