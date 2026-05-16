import type { Metadata } from "next";
import Link from "next/link";
import { fetchNeonOrdersDigest } from "@/lib/db/neon";

export const metadata: Metadata = {
  title: "Neon 注文データ | geek",
  description:
    "DATABASE_URL で接続した Neon 上の orders / order_items を表示するページです。",
};

export const dynamic = "force-dynamic";

function formatJa(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default async function NeonSamplePage() {
  const result = await fetchNeonOrdersDigest();

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[640px] px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-left">
      <p className="text-xs font-medium tracking-wide text-muted-foreground">
        株式会社 OSAKI ダイニング（架空）・インフラ検証
      </p>
      <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
        Neon 上の注文データ
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        同じ <code className="rounded bg-muted px-1">DATABASE_URL</code> で接続し、
        <code className="rounded bg-muted px-1">db/orders-schema.sql</code> で作成した{" "}
        <code className="rounded bg-muted px-1">orders</code> /{" "}
        <code className="rounded bg-muted px-1">order_items</code>{" "}
        から直近 50 件の注文を読み取って表示します（
        <code className="rounded bg-muted px-1">/Order</code> の「注文する」で保存された行がここに出ます）。
      </p>

      <div className="mt-6 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
        {result.ok ? (
          <>
            <p className="text-sm font-medium text-foreground">取得結果</p>
            {result.rows.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                まだ注文がありません。{" "}
                <code className="rounded bg-muted px-1">/Order</code> から商品を選び「注文する」で送信すると、ここに表示されます。
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {result.rows.map((order) => (
                  <li
                    key={order.id}
                    className="border border-border p-3 text-sm ring-1 ring-foreground/5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {order.id}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatJa(order.created_at)}
                      </span>
                    </div>
                    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs sm:grid-cols-4">
                      <div>
                        <dt className="text-muted-foreground">店舗コード</dt>
                        <dd className="font-medium">{order.store_code}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">ステータス</dt>
                        <dd className="font-medium">{order.status}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">行数</dt>
                        <dd className="tabular-nums font-medium">{order.line_count}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">合計（円）</dt>
                        <dd className="tabular-nums font-medium">
                          ¥{order.total_yen.toLocaleString("ja-JP")}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-3 overflow-x-auto rounded-md border border-border">
                      <table className="w-full min-w-[260px] border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-border bg-muted/40 text-left">
                            <th className="p-2 font-semibold">menu_id</th>
                            <th className="p-2 font-semibold">name</th>
                            <th className="p-2 font-semibold">qty</th>
                            <th className="p-2 font-semibold">単価（円）</th>
                            <th className="p-2 font-semibold">小計（円）</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.lines.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="p-2 text-center text-muted-foreground"
                              >
                                明細なし
                              </td>
                            </tr>
                          ) : (
                            order.lines.map((line, idx) => (
                              <tr
                                key={`${order.id}-${line.menu_id}-${idx}`}
                                className="border-b border-border last:border-b-0"
                              >
                                <td className="p-2 font-mono text-muted-foreground">
                                  {line.menu_id}
                                </td>
                                <td className="p-2">{line.name}</td>
                                <td className="p-2 tabular-nums">{line.qty}</td>
                                <td className="p-2 tabular-nums">
                                  ¥{line.unit_price_yen.toLocaleString("ja-JP")}
                                </td>
                                <td className="p-2 tabular-nums font-medium">
                                  ¥
                                  {(line.unit_price_yen * line.qty).toLocaleString(
                                    "ja-JP",
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
        ) : result.reason === "schema_missing" ? (
          <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">注文用テーブルがまだありません。</p>
            <p>{result.message}</p>
          </div>
        ) : (
          <div className="space-y-2 text-sm leading-relaxed">
            <p className="font-medium text-destructive">接続またはクエリに失敗しました。</p>
            <p className="rounded-md border border-destructive/30 bg-destructive/5 p-2 font-mono text-xs text-destructive">
              {result.message ?? "不明なエラー"}
            </p>
            <p className="text-muted-foreground">
              テーブル未作成の場合は、Neon の SQL Editor で{" "}
              <code className="rounded bg-muted px-1">db/orders-schema.sql</code> を実行してください。
            </p>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        接続先は常に <code className="rounded bg-muted px-1">DATABASE_URL</code>{" "}
        が指す Neon のデータベースです。旧デモ用の{" "}
        <code className="rounded bg-muted px-1">neon_sample</code> テーブルは参照していません。
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
