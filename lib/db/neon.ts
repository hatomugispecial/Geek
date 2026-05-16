import { neon } from "@neondatabase/serverless";

export type NeonSampleRow = {
  id: number;
  label: string;
  value: string;
};

export type NeonSampleResult =
  | { ok: true; rows: NeonSampleRow[] }
  | {
      ok: false;
      reason: "missing_env" | "error";
      message?: string;
    };

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url?.trim()) return null;
  return neon(url);
}

/** サーバー専用。`neon_sample` テーブルからサンプル行を取得する。 */
export async function fetchNeonSampleRows(): Promise<NeonSampleResult> {
  const sql = getSql();
  if (!sql) return { ok: false, reason: "missing_env" };
  try {
    const rows = await sql`
      SELECT id, label, value
      FROM neon_sample
      ORDER BY id
    `;
    return {
      ok: true,
      rows: rows as NeonSampleRow[],
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: "error", message };
  }
}
