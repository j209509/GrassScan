import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthShell
      current="signup"
      eyebrow="無料で始める"
      title="GrassScan のローカルアカウントを作成"
      description="この MVP では、新規登録を軽量なローカル実装に留め、すぐにプロダクト体験へ進めるようにしています。"
    >
      <SignupForm />
    </AuthShell>
  );
}
