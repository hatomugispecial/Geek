import { getNeonSql } from "@/lib/db/neon";

/**
 * 店舗アカウント登録前に、Better Auth 用の `user` テーブル有無を表示する。
 */
export async function RegisterDbBanner() {
  const sql = getNeonSql();
  if (!sql) {
    return (
      <aside
        role="status"
        className="mx-auto mb-6 max-w-md rounded-sm border border-amber-600/40 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-50"
      >
        <strong className="font-semibold">DATABASE_URL</strong> が未設定です。プロジェクト直下の{" "}
        <code className="rounded bg-background/60 px-1 py-0.5 font-mono text-xs">.env.local</code>{" "}
        に Neon の接続文字列を設定してください。
      </aside>
    );
  }

  let userTableExists = false;
  try {
    const rows = await sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'user'
      ) AS user_table_exists
    `;
    const row = rows[0] as { user_table_exists?: boolean } | undefined;
    userTableExists = Boolean(row?.user_table_exists);
  } catch {
    return (
      <aside
        role="alert"
        className="mx-auto mb-6 max-w-md rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-left text-sm text-destructive"
      >
        Neon への接続に失敗しました。<code className="rounded bg-muted px-1 font-mono text-xs">DATABASE_URL</code>{" "}
        が正しいか確認してください。
      </aside>
    );
  }

  if (userTableExists) return null;

  return (
    <aside
      role="alert"
      className="mx-auto mb-6 max-w-md rounded-sm border border-amber-600/40 bg-amber-50 px-4 py-3 text-left text-sm leading-relaxed text-amber-950 dark:bg-amber-950/30 dark:text-amber-50"
    >
      <p className="font-semibold">このままではアカウント登録に失敗します。</p>
      <p className="mt-2">
        Neon の SQL Editor でリポジトリ内の{" "}
        <code className="rounded bg-background/60 px-1.5 py-0.5 font-mono text-xs">
          db/better-auth-schema.sql
        </code>{" "}
        を実行し、<code className="rounded bg-background/60 px-1 font-mono text-xs">user</code> などのテーブルを作成してください。
      </p>
    </aside>
  );
}
