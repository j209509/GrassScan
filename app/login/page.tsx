import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      current="login"
      eyebrow="おかえりなさい"
      title="数秒でスキャン画面へ戻れます。"
      description="この MVP のログインは意図的にシンプルです。ローカルにデモセッションを作成し、認証基盤がなくても全体の体験を確認できます。"
    >
      <LoginForm />
    </AuthShell>
  );
}
