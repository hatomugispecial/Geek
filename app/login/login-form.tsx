"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function safeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/store";
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (error) {
        setMessage(error.message ?? "ログインに失敗しました。");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setMessage("ログインに失敗しました。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-10 text-left">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">店舗ログイン</h1>
        <p className="text-base text-muted-foreground">
          従業員向けコンソール（<code className="rounded bg-muted px-1.5 py-0.5 text-sm">/store</code>
          ）用です。初回のみ{" "}
          <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
            アカウント登録
          </Link>
          からユーザーを作成してください。
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-sm border border-border bg-card p-4 ring-1 ring-border sm:p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="login-email">メール</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
            className="min-h-12 min-w-[min(100%,320px)] text-base"
            placeholder="例：staff@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">パスワード</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
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
          <LogIn className="size-5 shrink-0" aria-hidden />
          {busy ? "送信中…" : "ログイン"}
        </Button>
      </form>
    </main>
  );
}
