"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (error) {
        const detail =
          "status" in error && typeof error.status === "number"
            ? `（HTTP ${error.status}）`
            : "";
        const code =
          error && typeof error === "object" && "code" in error
            ? String((error as { code?: unknown }).code ?? "")
            : "";
        const hint =
          code === "PASSWORD_TOO_SHORT"
            ? "パスワードを長くしてください。"
            : "Neon で db/better-auth-schema.sql を実行済みか、.env.local の DATABASE_URL / BETTER_AUTH_URL を確認してください。";
        setMessage(
          `${error.message ?? "登録に失敗しました。"}${detail}${code ? ` [${code}]` : ""} ${hint}`,
        );
        return;
      }
      router.push("/store");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(`登録に失敗しました: ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-10 text-left">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">店舗アカウント登録</h1>
        <p className="text-base text-muted-foreground">
          初回セットアップ用です。Neon で{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">db/better-auth-schema.sql</code>{" "}
          を未実行のままだと登録に失敗します（DB に <code className="rounded bg-muted px-1.5 py-0.5 text-sm">user</code>{" "}
          テーブルが必要です）。運用では本ページへの導線を外してください。既にアカウントがある場合は{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            ログイン
          </Link>
          へ。
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-sm border border-border bg-card p-4 ring-1 ring-border sm:p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="reg-name">表示名</Label>
          <Input
            id="reg-name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            required
            className="min-h-12 min-w-[min(100%,320px)] text-base"
            placeholder="例：山田太郎"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-email">メール</Label>
          <Input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
            className="min-h-12 min-w-[min(100%,320px)] text-base"
            placeholder="例：xxxx@gmail.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-password">パスワード</Label>
          <Input
            id="reg-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
            minLength={8}
            className="min-h-12 min-w-[min(100%,320px)] text-base"
          />
        </div>
        {message ? (
          <p className="text-sm text-destructive" role="alert">
            {message}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={busy}
          className="inline-flex h-12 min-h-12 w-full items-center justify-center gap-2 rounded-[10px] text-base font-medium"
        >
          <UserPlus className="size-5 shrink-0" aria-hidden />
          {busy ? "送信中…" : "登録してログイン"}
        </Button>
      </form>
    </main>
  );
}
