/** DB / API で使う注文フロー上のステータスコード */
export const ORDER_FLOW_STATUS_CODES = [
  "pending",
  "cooking",
  "ready",
  "served",
  "cancelled",
] as const;

export type OrderFlowStatusCode = (typeof ORDER_FLOW_STATUS_CODES)[number];

export const ORDER_FLOW_STATUS_LABEL: Record<OrderFlowStatusCode, string> = {
  pending: "未着手",
  cooking: "調理中",
  ready: "提供待ち",
  served: "提供済み",
  cancelled: "取消済み",
};

export function isOrderFlowStatus(s: string): s is OrderFlowStatusCode {
  return (ORDER_FLOW_STATUS_CODES as readonly string[]).includes(s);
}

export function normalizeLegacyStatus(s: string): OrderFlowStatusCode {
  if (isOrderFlowStatus(s)) return s;
  if (s === "received") return "pending";
  return "pending";
}

/**
 * 明細各行のステータスから、注文ヘッダに載せる代表ステータスを算出する。
 * 取消のみの注文は取消、全行提供済みなら提供済み、それ以外は未完了のうち最も進んだ段階を採用。
 */
export function aggregateOrderStatusFromLines(
  lineStatuses: string[],
): OrderFlowStatusCode {
  const normalized = lineStatuses.map((s) => normalizeLegacyStatus(s));
  const active = normalized.filter((s) => s !== "cancelled");
  if (active.length === 0) return "cancelled";
  const incomplete = active.filter((s) => s !== "served");
  if (incomplete.length === 0) return "served";
  if (incomplete.some((s) => s === "ready")) return "ready";
  if (incomplete.some((s) => s === "cooking")) return "cooking";
  return "pending";
}
