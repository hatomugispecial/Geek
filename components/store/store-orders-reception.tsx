"use client";

import * as React from "react";
import type { NeonOrdersLine, NeonOrdersRow } from "@/lib/db/neon";
import {
  ORDER_FLOW_STATUS_CODES,
  ORDER_FLOW_STATUS_LABEL,
  isOrderFlowStatus,
  normalizeLegacyStatus,
} from "@/lib/store/order-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type SeatMenuAggregateRow = {
  menu_id: string;
  name: string;
  total_qty: number;
  line_amount_yen: number;
};

type SeatSummary = {
  orderCount: number;
  totalYen: number;
  dishLineCount: number;
  menus: SeatMenuAggregateRow[];
};

function formatJaCompact(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function isTodayJst(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const j = (x: Date) =>
    x.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
  return j(d) === j(now);
}

function isPendingFlow(status: string) {
  const s = normalizeLegacyStatus(status);
  return s !== "served" && s !== "cancelled";
}

export function StoreOrdersReception() {
  const [tab, setTab] = React.useState<"today" | "pending" | "all">("today");
  const [orders, setOrders] = React.useState<NeonOrdersRow[]>([]);
  const [seatInput, setSeatInput] = React.useState("");
  const [activeSeatFilter, setActiveSeatFilter] = React.useState<string | null>(
    null,
  );
  const [summary, setSummary] = React.useState<SeatSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lineBusyKey, setLineBusyKey] = React.useState<string | null>(null);

  const load = React.useCallback(async (seat?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const q =
        seat && seat.trim().length > 0
          ? `?seat=${encodeURIComponent(seat.trim())}`
          : "";
      const res = await fetch(`/api/store/orders${q}`);
      const data = (await res.json()) as {
        ok?: boolean;
        orders?: NeonOrdersRow[];
        summary?: (Omit<SeatSummary, "menus"> & { menus?: SeatMenuAggregateRow[] }) | null;
        seatFilter?: string | null;
        message?: string;
      };
      if (!res.ok || data.ok === false) {
        throw new Error(data.message ?? `取得に失敗しました（${res.status}）`);
      }
      setOrders(data.orders ?? []);
      setSummary(
        data.summary
          ? {
              ...data.summary,
              menus: Array.isArray(data.summary.menus)
                ? data.summary.menus
                : [],
            }
          : null,
      );
      setActiveSeatFilter(data.seatFilter ?? null);
    } catch (e) {
      setOrders([]);
      setSummary(null);
      setError(e instanceof Error ? e.message : "取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load(null);
  }, [load]);

  const filteredOrders = React.useMemo(() => {
    if (tab === "today") {
      return orders.filter((o) => isTodayJst(o.created_at));
    }
    if (tab === "pending") {
      return orders.filter((o) => isPendingFlow(o.status));
    }
    return orders;
  }, [orders, tab]);

  const compactRows = React.useMemo(() => {
    const sortedOrders = [...filteredOrders].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const rows: { order: NeonOrdersRow; line: NeonOrdersLine }[] = [];
    for (const order of sortedOrders) {
      for (const line of order.lines) {
        rows.push({ order, line });
      }
    }
    return rows;
  }, [filteredOrders]);

  /** 座席集計時: 当該座席の注文を注文日時の古い順 */
  const seatOrdersChronological = React.useMemo(() => {
    if (!summary) return [];
    return [...orders].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }, [summary, orders]);

  /** 会計用: 取消以外の注文を時系列で、明細行ごと（まとめず） */
  const seatCheckoutLineRows = React.useMemo(() => {
    if (!summary) return [];
    const rows: {
      key: string;
      createdAt: string;
      name: string;
      qty: number;
      subtotalYen: number;
    }[] = [];
    for (const o of seatOrdersChronological) {
      if (normalizeLegacyStatus(o.status) === "cancelled") continue;
      for (const line of o.lines) {
        const lid =
          line.id !== undefined && line.id !== null ? String(line.id) : "";
        rows.push({
          key: lid ? `${o.id}-${lid}` : `${o.id}-${line.menu_id}-${line.name}`,
          createdAt: o.created_at,
          name: line.name,
          qty: line.qty,
          subtotalYen: line.qty * line.unit_price_yen,
        });
      }
    }
    return rows;
  }, [summary, seatOrdersChronological]);

  const todayCount = React.useMemo(
    () => orders.filter((o) => isTodayJst(o.created_at)).length,
    [orders],
  );
  const pendingCount = React.useMemo(
    () => orders.filter((o) => isPendingFlow(o.status)).length,
    [orders],
  );

  const applySeatFilter = () => {
    void load(seatInput.trim() || null);
  };

  const clearSeatFilter = () => {
    setSeatInput("");
    void load(null);
  };

  const patchLineStatus = async (
    orderId: string,
    lineId: string,
    status: string,
  ) => {
    if (!isOrderFlowStatus(status)) return;
    setLineBusyKey(`${orderId}:${lineId}`);
    setError(null);
    try {
      const res = await fetch(
        `/api/store/orders/${encodeURIComponent(orderId)}/lines/${encodeURIComponent(lineId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
      };
      if (!res.ok) {
        throw new Error(data.message ?? `更新に失敗（${res.status}）`);
      }
      await load(activeSeatFilter);
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新に失敗しました");
    } finally {
      setLineBusyKey(null);
    }
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg border border-border bg-card p-3 ring-1 ring-border sm:p-4">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          座席で会計集計
        </h2>
        <p className="mt-1 text-sm leading-snug text-muted-foreground">
          取消済み注文は集計から除外します。座席は完全一致（前後の空白は無視）で照合します。
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="grid w-full min-w-0 flex-1 gap-2">
            <Label htmlFor="store-seat-filter" className="text-sm">
              座席番号
            </Label>
            <Input
              id="store-seat-filter"
              value={seatInput}
              onChange={(e) => setSeatInput(e.target.value)}
              placeholder="例：テーブル5"
              className="min-h-10 w-full min-w-[min(100%,320px)]"
              maxLength={64}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="rounded-[12px]" onClick={applySeatFilter}>
              絞り込み・集計
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-[12px]"
              onClick={clearSeatFilter}
            >
              クリア
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-[12px]"
              onClick={() => void load(activeSeatFilter)}
            >
              再取得
            </Button>
          </div>
        </div>
        {summary ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              取消を除く注文{" "}
              <strong className="font-semibold text-foreground tabular-nums">
                {summary.orderCount}
              </strong>{" "}
              件
            </p>
            {seatCheckoutLineRows.length > 0 ? (
              <>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    お会計明細（注文ごとの行・古い順）
                  </p>
                  <div className="mt-2 max-h-[min(48dvh,420px)] overflow-auto rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-9 px-2 py-2 text-xs sm:text-sm">
                            日時
                          </TableHead>
                          <TableHead className="h-9 px-2 py-2 text-xs sm:text-sm">
                            メニュー名
                          </TableHead>
                          <TableHead className="h-9 px-2 py-2 text-right text-xs tabular-nums sm:text-sm">
                            個数
                          </TableHead>
                          <TableHead className="h-9 px-2 py-2 text-right text-xs tabular-nums sm:text-sm">
                            小計（円）
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {seatCheckoutLineRows.map((r) => (
                          <TableRow key={r.key} className="hover:bg-muted/40">
                            <TableCell className="whitespace-nowrap px-2 py-2 text-xs tabular-nums text-muted-foreground sm:text-sm">
                              {formatJaCompact(r.createdAt)}
                            </TableCell>
                            <TableCell
                              className="max-w-[min(52vw,14rem)] truncate px-2 py-2 text-xs font-medium sm:max-w-[18rem] sm:text-sm"
                              title={r.name}
                            >
                              {r.name}
                            </TableCell>
                            <TableCell className="px-2 py-2 text-right text-xs tabular-nums font-medium sm:text-sm">
                              {r.qty}
                            </TableCell>
                            <TableCell className="px-2 py-2 text-right text-xs font-semibold tabular-nums text-orange-950 sm:text-sm">
                              ¥{r.subtotalYen.toLocaleString("ja-JP")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="rounded-md border border-orange-200/60 bg-orange-50/50 px-4 py-5 text-center ring-1 ring-orange-100/50">
                  <p className="text-sm font-medium text-muted-foreground">
                    最終金額（取消除く・税込想定）
                  </p>
                  <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-orange-950 sm:text-3xl md:text-4xl">
                    ¥{summary.totalYen.toLocaleString("ja-JP")}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                この座席で、取消を除く注文明細がまだありません。
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-border bg-card p-3 ring-1 ring-border sm:p-4">
        <Tabs
        value={tab}
        onValueChange={(v) =>
          setTab((v as "today" | "pending" | "all") ?? "today")
        }
        className="w-full gap-0"
      >
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-2">
          <TabsList className="h-9 gap-0.5 p-0.5">
            <TabsTrigger value="today" className="px-3 py-1.5 text-sm">
              本日
            </TabsTrigger>
            <TabsTrigger value="pending" className="px-3 py-1.5 text-sm">
              未完了
            </TabsTrigger>
            <TabsTrigger value="all" className="px-3 py-1.5 text-sm">
              すべて
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground sm:text-sm">
            <span>
              明細{" "}
              <strong className="font-semibold text-foreground tabular-nums">
                {compactRows.length}
              </strong>{" "}
              行
            </span>
            <span>
              本日の注文{" "}
              <strong className="font-semibold text-foreground tabular-nums">
                {todayCount}
              </strong>
            </span>
            <span>
              未完了の注文{" "}
              <strong className="font-semibold text-foreground tabular-nums">
                {pendingCount}
              </strong>
            </span>
            {activeSeatFilter ? (
              <span className="max-w-[12rem] truncate">
                席{" "}
                <strong className="font-medium text-foreground">
                  {activeSeatFilter}
                </strong>
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-2">
          {error ? (
            <p
              role="alert"
              className="rounded-md border border-red-300/60 bg-red-50/90 p-3 text-sm text-red-950 sm:text-base"
            >
              {error}
            </p>
          ) : null}
          {loading ? (
            <p className="py-6 text-center text-sm text-muted-foreground sm:text-base">
              読み込み中…
            </p>
          ) : filteredOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground sm:text-base">
              該当する注文がありません
            </p>
          ) : compactRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground sm:text-base">
              表示中の注文に明細がありません
            </p>
          ) : (
            <div className="max-h-[min(65dvh,560px)] overflow-auto rounded-md border border-border">
              <table className="w-full border-collapse text-left text-sm">
                <TableHeader className="sticky top-0 z-10 border-b border-border bg-muted/95 backdrop-blur-sm [&_tr]:border-b-0 [&_tr:hover]:bg-transparent">
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableHead className="h-9 whitespace-nowrap px-2 py-2 text-xs font-semibold sm:text-sm">
                      日時
                    </TableHead>
                    <TableHead className="h-9 whitespace-nowrap px-2 py-2 text-xs font-semibold sm:text-sm">
                      座席
                    </TableHead>
                    <TableHead className="h-9 min-w-0 px-2 py-2 text-xs font-semibold sm:text-sm">
                      料理名
                    </TableHead>
                    <TableHead className="h-9 whitespace-nowrap px-2 py-2 text-right text-xs font-semibold tabular-nums sm:text-sm">
                      個数
                    </TableHead>
                    <TableHead className="h-9 whitespace-nowrap px-2 py-2 text-xs font-semibold sm:text-sm">
                      ステータス
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compactRows.map(({ order: row, line }) => {
                    const lineIdStr =
                      line.id !== undefined && line.id !== null
                        ? String(line.id)
                        : "";
                    const hasNumericId = /^\d+$/.test(lineIdStr);
                    const lineSt = normalizeLegacyStatus(
                      line.status ?? "pending",
                    );
                    const lineStatusJa = ORDER_FLOW_STATUS_LABEL[lineSt];
                    const busy = lineBusyKey === `${row.id}:${lineIdStr}`;
                    const orderSt = normalizeLegacyStatus(row.status);
                    const muted =
                      orderSt === "cancelled" || lineSt === "cancelled";
                    const seatDisp =
                      row.seat_label.trim() === "" ? "—" : row.seat_label;
                    return (
                      <TableRow
                        key={
                          hasNumericId
                            ? `${row.id}-line-${lineIdStr}`
                            : `${row.id}-${line.menu_id}-${line.name}`
                        }
                        className={cn(
                          "border-b border-border/70 hover:bg-muted/25",
                          muted && "bg-muted/20 text-muted-foreground",
                        )}
                      >
                        <TableCell className="whitespace-nowrap px-2 py-2 tabular-nums text-xs text-muted-foreground sm:text-sm">
                          {formatJaCompact(row.created_at)}
                        </TableCell>
                        <TableCell
                          className="max-w-[5.5rem] truncate px-2 py-2 text-xs font-medium sm:text-sm"
                          title={seatDisp}
                        >
                          {seatDisp}
                        </TableCell>
                        <TableCell
                          className="max-w-[min(42vw,11rem)] truncate px-2 py-2 text-xs font-medium sm:max-w-[14rem] sm:text-sm"
                          title={line.name}
                        >
                          {line.name}
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-2 py-2 text-right text-xs tabular-nums font-medium sm:text-sm">
                          {line.qty}
                        </TableCell>
                        <TableCell className="min-w-[7.5rem] px-1 py-1.5">
                          {hasNumericId ? (
                            <Select
                              value={lineSt}
                              disabled={busy}
                              onValueChange={(v) => {
                                if (v && isOrderFlowStatus(v)) {
                                  void patchLineStatus(row.id, lineIdStr, v);
                                }
                              }}
                            >
                              <SelectTrigger className="h-9 w-full min-w-[6.75rem] gap-1 text-sm shadow-none ring-1 ring-border">
                                <SelectValue placeholder={lineStatusJa} />
                              </SelectTrigger>
                              <SelectContent className="shadow-none ring-1 ring-border">
                                {ORDER_FLOW_STATUS_CODES.map((code) => (
                                  <SelectItem key={code} value={code}>
                                    {ORDER_FLOW_STATUS_LABEL[code]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="px-1 text-xs text-muted-foreground sm:text-sm">
                              {lineStatusJa}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </table>
            </div>
          )}
        </div>
      </Tabs>
      </div>
    </div>
  );
}
