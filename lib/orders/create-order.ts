import type { NeonQueryFunction } from "@neondatabase/serverless";
import { MENU_ITEMS } from "@/lib/order/menu-data";

const MAX_LINES = 50;
const MAX_QTY = 99;
const MAX_UNIT = 1_000_000;

export type OrderLineInput = {
  menuId: string;
  qty: number;
};

export type CreateOrderBody = {
  storeCode?: string;
  /** 会計・店舗画面での集計用（任意） */
  seatLabel?: string;
  lines: OrderLineInput[];
};

export type CreateOrderSuccess = { ok: true; orderId: string };

export type CreateOrderFailure = {
  ok: false;
  httpStatus: number;
  code: string;
  message: string;
};

export type CreateOrderResult = CreateOrderSuccess | CreateOrderFailure;

const MENU_BY_ID = new Map(MENU_ITEMS.map((m) => [m.id, m]));

function normalizeLines(raw: unknown): OrderLineInput[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const merged = new Map<string, number>();
  for (const row of raw) {
    if (!row || typeof row !== "object") return null;
    const menuId = (row as { menuId?: unknown }).menuId;
    const qty = (row as { qty?: unknown }).qty;
    if (typeof menuId !== "string" || menuId.length === 0 || menuId.length > 64)
      return null;
    if (typeof qty !== "number" || !Number.isInteger(qty)) return null;
    if (qty < 1 || qty > MAX_QTY) return null;
    merged.set(menuId, (merged.get(menuId) ?? 0) + qty);
  }
  const lines = [...merged.entries()].map(([menuId, q]) => ({
    menuId,
    qty: q,
  }));
  if (lines.length > MAX_LINES) return null;
  return lines;
}

function expandFromCatalog(
  lines: OrderLineInput[],
):
  | {
      rows: {
        menu_id: string;
        qty: number;
        name: string;
        unit_price_yen: number;
      }[];
      totalYen: number;
    }
  | { error: string } {
  const rows: {
    menu_id: string;
    qty: number;
    name: string;
    unit_price_yen: number;
  }[] = [];
  let totalYen = 0;
  for (const { menuId, qty } of lines) {
    const item = MENU_BY_ID.get(menuId);
    if (!item) return { error: `不明なメニューです: ${menuId}` };
    if (item.soldOut) return { error: `品切れのメニューは注文できません: ${item.name}` };
    const unit = item.price;
    if (unit < 0 || unit > MAX_UNIT) return { error: "単価が不正です。" };
    totalYen += unit * qty;
    if (totalYen > MAX_UNIT * MAX_QTY * MAX_LINES) return { error: "合計金額が大きすぎます。" };
    rows.push({
      menu_id: menuId,
      qty,
      name: item.name,
      unit_price_yen: unit,
    });
  }
  return { rows, totalYen };
}

/**
 * 注文を検証し Neon に 1 文で INSERT（ヘッダ + 明細）。サーバー専用。
 */
export async function createOrderInDb(
  sql: NeonQueryFunction<false, false>,
  body: unknown,
): Promise<CreateOrderResult> {
  if (!body || typeof body !== "object") {
    return {
      ok: false,
      httpStatus: 400,
      code: "invalid_body",
      message: "JSON オブジェクトで送信してください。",
    };
  }

  const { storeCode: rawStore, seatLabel: rawSeat, lines: rawLines } =
    body as CreateOrderBody;
  const lines = normalizeLines(rawLines);
  if (!lines) {
    return {
      ok: false,
      httpStatus: 400,
      code: "invalid_lines",
      message:
        "lines は 1 件以上、各要素に menuId（文字列）と qty（1〜99 の整数）が必要です。",
    };
  }

  const storeCode =
    typeof rawStore === "string" && rawStore.length > 0 && rawStore.length <= 100
      ? rawStore
      : "osaki-shinagawa";

  let seatLabel = "";
  if (typeof rawSeat === "string") {
    seatLabel = rawSeat.trim().slice(0, 64);
  }

  const expanded = expandFromCatalog(lines);
  if ("error" in expanded) {
    return {
      ok: false,
      httpStatus: 400,
      code: "catalog_reject",
      message: expanded.error,
    };
  }

  const payload = JSON.stringify(expanded.rows);

  try {
    const inserted = await sql`
      WITH expanded AS (
        SELECT *
        FROM jsonb_to_recordset(${payload}::jsonb)
          AS x(
            menu_id text,
            qty int,
            name text,
            unit_price_yen int
          )
      ),
      new_order AS (
        INSERT INTO orders (store_code, seat_label, total_yen, line_count, status)
        SELECT
          ${storeCode},
          ${seatLabel},
          (SELECT COALESCE(SUM(unit_price_yen * qty), 0)::int FROM expanded),
          (SELECT COUNT(*)::int FROM expanded),
          'pending'
        RETURNING id
      )
      INSERT INTO
        order_items (order_id, menu_id, name, qty, unit_price_yen, status)
      SELECT new_order.id, e.menu_id, e.name, e.qty, e.unit_price_yen, 'pending'::text
      FROM new_order
        CROSS JOIN expanded e
      RETURNING order_id
    `;
    const first = inserted[0] as { order_id: string } | undefined;
    if (!first?.order_id) {
      return {
        ok: false,
        httpStatus: 500,
        code: "insert_unexpected",
        message: "保存結果を取得できませんでした。",
      };
    }
    return { ok: true, orderId: first.order_id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("order_items") && msg.includes("status")) {
      return {
        ok: false,
        httpStatus: 503,
        code: "schema_outdated",
        message:
          "order_items に status 列がありません。Neon で db/orders-migration-v3-order-item-status.sql を実行するか、db/orders-schema.sql を再適用してください。",
      };
    }
    if (
      msg.includes("seat_label") ||
      (msg.includes("column") && msg.includes("does not exist"))
    ) {
      return {
        ok: false,
        httpStatus: 503,
        code: "schema_outdated",
        message:
          "orders テーブルが旧バージョンです。Neon で db/orders-migration-v2-seat-status.sql を実行するか、db/orders-schema.sql を再適用してください。",
      };
    }
    if (msg.includes("relation") && msg.includes("does not exist")) {
      return {
        ok: false,
        httpStatus: 503,
        code: "schema_missing",
        message:
          "注文テーブルが未作成です。Neon で db/orders-schema.sql を実行してください。",
      };
    }
    return {
      ok: false,
      httpStatus: 500,
      code: "db_error",
      message: "データベースへの保存に失敗しました。",
    };
  }
}
