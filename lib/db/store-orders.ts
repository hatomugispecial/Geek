import type { NeonQueryFunction } from "@neondatabase/serverless";
import { getNeonSql } from "@/lib/db/neon";
import type { NeonOrdersLine, NeonOrdersRow } from "@/lib/db/neon";
import {
  aggregateOrderStatusFromLines,
  isOrderFlowStatus,
} from "@/lib/store/order-flow";

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

function mapOrderRow(r: Record<string, unknown>): NeonOrdersRow {
  return {
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
  };
}

export type SeatMenuAggregateRow = {
  menu_id: string;
  name: string;
  total_qty: number;
  line_amount_yen: number;
};

export type SeatSummary = {
  orderCount: number;
  totalYen: number;
  dishLineCount: number;
  /** 座席フィルター時のみ。取消済み注文は除外してメニュー単位に集計 */
  menus: SeatMenuAggregateRow[];
};

export type StoreOrdersListResult =
  | {
      ok: true;
      orders: NeonOrdersRow[];
      summary: SeatSummary | null;
      seatFilter: string | null;
    }
  | { ok: false; reason: "missing_env" | "schema_missing" | "error"; message?: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const LINE_ID_RE = /^\d+$/;

async function syncOrderHeaderFromLineStatuses(
  sql: NeonQueryFunction<false, false>,
  orderId: string,
): Promise<void> {
  const rows = await sql`
    SELECT
      status
    FROM
      order_items
    WHERE
      order_id = ${orderId}::uuid
  `;
  const statuses = (rows as { status?: string }[]).map((r) =>
    String(r.status ?? "pending"),
  );
  const next = aggregateOrderStatusFromLines(statuses);
  await sql`
    UPDATE orders
    SET
      status = ${next}
    WHERE
      id = ${orderId}::uuid
  `;
}

export async function listOrdersForStore(
  sql: NeonQueryFunction<false, false>,
  seatFilter?: string,
): Promise<StoreOrdersListResult> {
  const seat = seatFilter?.trim() ?? "";

  try {
    if (seat.length > 0) {
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
        WHERE
          TRIM(o.seat_label) = ${seat}
        GROUP BY
          o.id,
          o.store_code,
          o.seat_label,
          o.total_yen,
          o.line_count,
          o.status,
          o.created_at
        ORDER BY
          o.created_at ASC
        LIMIT
          100
      `;

      const [agg] = await sql`
        SELECT
          COUNT(*)::int AS order_count,
          COALESCE(SUM(total_yen), 0)::int AS total_yen,
          COALESCE(SUM(line_count), 0)::int AS dish_line_count
        FROM orders
        WHERE
          TRIM(seat_label) = ${seat}
          AND status <> 'cancelled'
      `;

      const menuRows = await sql`
        SELECT
          i.menu_id,
          MAX(i.name) AS name,
          SUM(i.qty)::int AS total_qty,
          COALESCE(SUM(i.qty * i.unit_price_yen), 0)::int AS line_amount_yen
        FROM order_items i
        INNER JOIN orders o ON o.id = i.order_id
        WHERE
          TRIM(o.seat_label) = ${seat}
          AND o.status <> 'cancelled'
        GROUP BY
          i.menu_id
        ORDER BY
          MAX(i.name)
      `;

      const menus: SeatMenuAggregateRow[] = (
        menuRows as Record<string, unknown>[]
      ).map((r) => ({
        menu_id: String(r.menu_id ?? ""),
        name: String(r.name ?? ""),
        total_qty: Number(r.total_qty ?? 0),
        line_amount_yen: Number(r.line_amount_yen ?? 0),
      }));

      const summary: SeatSummary = {
        orderCount: Number((agg as { order_count?: number }).order_count ?? 0),
        totalYen: Number((agg as { total_yen?: number }).total_yen ?? 0),
        dishLineCount: Number(
          (agg as { dish_line_count?: number }).dish_line_count ?? 0,
        ),
        menus,
      };

      return {
        ok: true,
        orders: (rows as Record<string, unknown>[]).map(mapOrderRow),
        summary,
        seatFilter: seat,
      };
    }

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
      GROUP BY
        o.id,
        o.store_code,
        o.seat_label,
        o.total_yen,
        o.line_count,
        o.status,
        o.created_at
      ORDER BY
        o.created_at ASC
      LIMIT
        100
    `;

    return {
      ok: true,
      orders: (rows as Record<string, unknown>[]).map(mapOrderRow),
      summary: null,
      seatFilter: null,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("relation") && message.includes("does not exist")) {
      return {
        ok: false,
        reason: "schema_missing",
        message:
          "orders テーブルがありません。db/orders-schema.sql を Neon で実行してください。",
      };
    }
    if (message.includes("order_items") && message.includes("status")) {
      return {
        ok: false,
        reason: "schema_missing",
        message:
          "order_items に status がありません。db/orders-migration-v3-order-item-status.sql を Neon で実行してください。",
      };
    }
    if (
      message.includes("seat_label") &&
      message.includes("does not exist")
    ) {
      return {
        ok: false,
        reason: "schema_missing",
        message:
          "orders に seat_label がありません。db/orders-migration-v2-seat-status.sql を実行してください。",
      };
    }
    return { ok: false, reason: "error", message };
  }
}

export async function listOrdersForStoreFromEnv(
  seatFilter?: string,
): Promise<StoreOrdersListResult> {
  const sql = getNeonSql();
  if (!sql) return { ok: false, reason: "missing_env" };
  return listOrdersForStore(sql, seatFilter);
}

export type PatchOrderStatusResult =
  | { ok: true }
  | { ok: false; httpStatus: number; code: string; message: string };

export async function patchOrderStatusInDb(
  sql: NeonQueryFunction<false, false>,
  orderId: string,
  status: string,
): Promise<PatchOrderStatusResult> {
  if (!UUID_RE.test(orderId)) {
    return {
      ok: false,
      httpStatus: 400,
      code: "invalid_id",
      message: "注文 ID が不正です。",
    };
  }
  if (!isOrderFlowStatus(status)) {
    return {
      ok: false,
      httpStatus: 400,
      code: "invalid_status",
      message: "ステータスが不正です。",
    };
  }

  try {
    const updated = await sql`
      UPDATE orders
      SET
        status = ${status}
      WHERE
        id = ${orderId}::uuid
      RETURNING
        id
    `;
    if (!updated.length) {
      return {
        ok: false,
        httpStatus: 404,
        code: "not_found",
        message: "該当する注文がありません。",
      };
    }
    await sql`
      UPDATE order_items
      SET
        status = ${status}
      WHERE
        order_id = ${orderId}::uuid
    `;
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("check constraint") || msg.includes("violates check")) {
      return {
        ok: false,
        httpStatus: 400,
        code: "status_rejected",
        message: "このステータスには更新できません。DB の制約を確認してください。",
      };
    }
    return {
      ok: false,
      httpStatus: 500,
      code: "db_error",
      message: "更新に失敗しました。",
    };
  }
}

export async function patchOrderStatusFromEnv(
  orderId: string,
  status: string,
): Promise<PatchOrderStatusResult> {
  const sql = getNeonSql();
  if (!sql) {
    return {
      ok: false,
      httpStatus: 503,
      code: "database_unconfigured",
      message: "DATABASE_URL が未設定です。",
    };
  }
  if (!isOrderFlowStatus(status)) {
    return {
      ok: false,
      httpStatus: 400,
      code: "invalid_status",
      message: "ステータスが不正です。",
    };
  }
  return patchOrderStatusInDb(sql, orderId, status);
}

export async function patchOrderLineStatusInDb(
  sql: NeonQueryFunction<false, false>,
  orderId: string,
  lineIdStr: string,
  status: string,
): Promise<PatchOrderStatusResult> {
  if (!UUID_RE.test(orderId)) {
    return {
      ok: false,
      httpStatus: 400,
      code: "invalid_order_id",
      message: "注文 ID が不正です。",
    };
  }
  if (!LINE_ID_RE.test(lineIdStr)) {
    return {
      ok: false,
      httpStatus: 400,
      code: "invalid_line_id",
      message: "明細 ID が不正です。",
    };
  }
  if (!isOrderFlowStatus(status)) {
    return {
      ok: false,
      httpStatus: 400,
      code: "invalid_status",
      message: "ステータスが不正です。",
    };
  }

  const lineId = BigInt(lineIdStr);

  try {
    const updated = await sql`
      UPDATE order_items
      SET
        status = ${status}
      WHERE
        id = ${lineId}
        AND order_id = ${orderId}::uuid
      RETURNING
        id
    `;
    if (!updated.length) {
      return {
        ok: false,
        httpStatus: 404,
        code: "not_found",
        message: "該当する注文明細がありません。",
      };
    }
    await syncOrderHeaderFromLineStatuses(sql, orderId);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (
      (msg.includes("column") && msg.includes("does not exist")) ||
      (msg.includes("order_items") && msg.includes("status"))
    ) {
      return {
        ok: false,
        httpStatus: 503,
        code: "schema_outdated",
        message:
          "order_items に status がありません。Neon で db/orders-migration-v3-order-item-status.sql を実行してください。",
      };
    }
    if (msg.includes("check constraint") || msg.includes("violates check")) {
      return {
        ok: false,
        httpStatus: 400,
        code: "status_rejected",
        message: "このステータスには更新できません。DB の制約を確認してください。",
      };
    }
    return {
      ok: false,
      httpStatus: 500,
      code: "db_error",
      message: "更新に失敗しました。",
    };
  }
}

export async function patchOrderLineStatusFromEnv(
  orderId: string,
  lineIdStr: string,
  status: string,
): Promise<PatchOrderStatusResult> {
  const sql = getNeonSql();
  if (!sql) {
    return {
      ok: false,
      httpStatus: 503,
      code: "database_unconfigured",
      message: "DATABASE_URL が未設定です。",
    };
  }
  if (!isOrderFlowStatus(status)) {
    return {
      ok: false,
      httpStatus: 400,
      code: "invalid_status",
      message: "ステータスが不正です。",
    };
  }
  return patchOrderLineStatusInDb(sql, orderId, lineIdStr, status);
}
