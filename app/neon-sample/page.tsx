import type { Metadata } from "next";
import Link from "next/link";
import { fetchNeonSampleRows } from "@/lib/db/neon";

export const metadata: Metadata = {
  title: "Neon 接続サンプル | geek",
  description:
    "Vercel 上の Next.js から Neon PostgreSQL のサンプルデータを表示するデモです。",
};

export const dynamic = "force-dynamic";

export default async function NeonSamplePage() {
  const result = await fetchNeonSampleRows();

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[640px] px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-left">
      <p className="text-xs font-medium tracking-wide text-muted-foreground">
        株式会社 OSAKI ダイニング（架空）・インフラ検証
      </p>
      <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
        Neon PostgreSQL サンプル
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        このページはサーバー側で <code className="rounded bg-muted px-1">DATABASE_URL</code>{" "}
        経由の Neon に接続し、<code className="rounded bg-muted px-1">neon_sample</code>{" "}
        テーブルの内容を表示します。
      </p>

      <div className="mt-6 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
        {result.ok ? (
          <>
            <p className="text-sm font-medium text-foreground">取得結果</p>
            <div className="mt-3 overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[280px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="p-2 font-semibold">id</th>
                    <th className="p-2 font-semibold">label</th>
                    <th className="p-2 font-semibold">value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-4 text-center text-muted-foreground"
                      >
                        行がありません。Neon で <code className="rounded bg-muted px-1">db/neon-sample.sql</code>{" "}
                        を実行してください。
                      </td>
                    </tr>
                  ) : (
                    result.rows.map((row) => (
                      <tr key={row.id} className="border-b border-border last:border-b-0">
                        <td className="p-2 tabular-nums text-muted-foreground">
                          {row.id}
                        </td>
                        <td className="p-2 font-medium">{row.label}</td>
                        <td className="p-2">{row.value}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : result.reason === "missing_env" ? (
          <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">
              環境変数 <code className="rounded bg-muted px-1">DATABASE_URL</code> が未設定です。
            </p>
            <p>
              リポジトリの <code className="rounded bg-muted px-1">.env.example</code> を参考に{" "}
              <code className="rounded bg-muted px-1">.env.local</code> を作成し、Neon
              の接続文字列を設定してから再度開いてください。
            </p>
          </div>
        ) : (
          <div className="space-y-2 text-sm leading-relaxed">
            <p className="font-medium text-destructive">接続またはクエリに失敗しました。</p>
            <p className="rounded-md border border-destructive/30 bg-destructive/5 p-2 font-mono text-xs text-destructive">
              {result.message ?? "不明なエラー"}
            </p>
            <p className="text-muted-foreground">
              テーブル未作成の場合は、Neon の SQL Editor で{" "}
              <code className="rounded bg-muted px-1">db/neon-sample.sql</code> を実行してください。
            </p>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Vercel では Neon 公式の「Connect to Vercel」からプロジェクトを紐付けるか、
        Project Settings → Environment Variables に{" "}
        <code className="rounded bg-muted px-1">DATABASE_URL</code> を登録してください。
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex min-h-[44px] min-w-[44px] items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        入口へ戻る
      </Link>
    </div>
  );
}
