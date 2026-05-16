import { neon } from "@neondatabase/serverless";

export type NeonOrdersLine = {
  id?: string | number;
  menu_id: string;
  name: string;
  qty: number;
  unit_price_yen: number;
  /** 明細ごとのフロー状態（未マイグレ時は欠落し得る） */
  status?: string;
};

export type NeonOrdersRow = {
  id: string;
  store_code: string;
  seat_label: string;
  total_yen: number;
  line_count: number;
  status: string;
  created_at: string;
  lines: NeonOrdersLine[];
};

export type NeonOrdersResult =
  | { ok: true; rows: NeonOrdersRow[] }
  | {
      ok: false;
      reason: "missing_env" | "schema_missing" | "error";
      message?: string;
    };

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url?.trim()) return null;
  return neon(url);
}

/** サーバー専用。他モジュールから DB 接続を使い回す場合に利用。 */
export function getNeonSql() {
  return getSql();
}

function parseLinesJson(raw: unknown): NeonOrdersLine[] {
  if (Array.isArray(raw)) {
    return raw as NeonOrdersLine[];
  }
  if (typeof raw === "string") {
    try {
      const v = JSON.parse(raw) as unknown;
      return Array.isArray(v) ? (v as NeonOrdersLine[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * サーバー専用。`db/orders-schema.sql` で定義した `orders` / `order_items` を読み、
 * 直近の注文一覧（明細付き）を返す。
 */
export async function fetchNeonOrdersDigest(): Promise<NeonOrdersResult> {
  const sql = getSql();
  if (!sql) return { ok: false, reason: "missing_env" };
  try {
    const rows = await sql`
      SELECT
        o.id,
        o.store_code,
        o.seat_label,
        o.total_yen,
        o.line_count,
        o.status,
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', i.id,
              'menu_id', i.menu_id,
              'name', i.name,
              'qty', i.qty,
              'unit_price_yen', i.unit_price_yen,
              'status', i.status
            )
            ORDER BY i.id
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'::json
        ) AS lines
      FROM orders o
      LEFT JOIN order_items i ON i.order_id = o.id
      GROUP BY o.id, o.store_code, o.seat_label, o.total_yen, o.line_count, o.status, o.created_at
      ORDER BY o.created_at DESC
      LIMIT 50
    `;

    const normalized: NeonOrdersRow[] = (
      rows as Record<string, unknown>[]
    ).map((r) => ({
      id: String(r.id),
      store_code: String(r.store_code ?? ""),
      seat_label: String(r.seat_label ?? ""),
      total_yen: Number(r.total_yen ?? 0),
      line_count: Number(r.line_count ?? 0),
      status: String(r.status ?? ""),
      created_at:
        r.created_at instanceof Date
          ? r.created_at.toISOString()
          : String(r.created_at ?? ""),
      lines: parseLinesJson(r.lines),
    }));

    return { ok: true, rows: normalized };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("relation") && message.includes("does not exist")) {
      return {
        ok: false,
        reason: "schema_missing",
        message:
          "orders または order_items テーブルがありません。Neon の SQL Editor で db/orders-schema.sql を実行してください。",
      };
    }
    return { ok: false, reason: "error", message };
  }
}
