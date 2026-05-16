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
    const rows: { order: NeonOrdersRow; line: NeonOrdersLine }[] = [];
    for (const order of filteredOrders) {
      for (const line of order.lines) {
        rows.push({ order, line });
      }
    }
    rows.sort((a, b) => {
      const ta = new Date(a.order.created_at).getTime();
      const tb = new Date(b.order.created_at).getTime();
      return tb - ta;
    });
    return rows;
  }, [filteredOrders]);

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
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-3 ring-1 ring-border">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          座席で会計集計
        </h2>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
          取消済み注文は集計から除外します。座席は完全一致（前後の空白は無視）で照合します。
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="grid w-full min-w-0 flex-1 gap-2">
            <Label htmlFor="store-seat-filter" className="text-xs">
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
          <div className="mt-3 space-y-2">
            <dl className="grid gap-2 border border-border bg-muted/20 p-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-[10px] text-muted-foreground">注文件数（取消除く）</dt>
                <dd className="text-base font-semibold tabular-nums leading-tight">
                  {summary.orderCount}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] text-muted-foreground">合計金額（取消除く）</dt>
                <dd className="text-base font-semibold tabular-nums leading-tight text-orange-950">
                  ¥{summary.totalYen.toLocaleString("ja-JP")}
                </dd>
              </div>
            </dl>
            {summary.menus.length > 0 ? (
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-8 px-2 py-1 text-xs">メニュー</TableHead>
                      <TableHead className="h-8 px-2 py-1 text-right text-xs tabular-nums">
                        合計数量
                      </TableHead>
                      <TableHead className="h-8 px-2 py-1 text-right text-xs tabular-nums">
                        金額（円）
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.menus.map((m) => (
                      <TableRow key={m.menu_id} className="hover:bg-muted/40">
                        <TableCell className="max-w-[200px] truncate px-2 py-1.5 text-xs font-medium">
                          {m.name}
                        </TableCell>
                        <TableCell className="px-2 py-1.5 text-right text-xs tabular-nums">
                          {m.total_qty}
                        </TableCell>
                        <TableCell className="px-2 py-1.5 text-right text-xs font-semibold tabular-nums text-orange-950">
                          ¥{m.line_amount_yen.toLocaleString("ja-JP")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-muted-foreground">
                この座席で、取消を除く注文明細がまだありません。
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-border bg-card p-2 ring-1 ring-border sm:p-3">
        <Tabs
        value={tab}
        onValueChange={(v) =>
          setTab((v as "today" | "pending" | "all") ?? "today")
        }
        className="w-full gap-0"
      >
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-2">
          <TabsList className="h-8 gap-0.5 p-0.5">
            <TabsTrigger value="today" className="px-2.5 py-1 text-xs">
              本日
            </TabsTrigger>
            <TabsTrigger value="pending" className="px-2.5 py-1 text-xs">
              未完了
            </TabsTrigger>
            <TabsTrigger value="all" className="px-2.5 py-1 text-xs">
              すべて
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
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
              className="rounded-md border border-red-300/60 bg-red-50/90 p-3 text-sm text-red-950"
            >
              {error}
            </p>
          ) : null}
          {loading ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              読み込み中…
            </p>
          ) : filteredOrders.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              該当する注文がありません
            </p>
          ) : compactRows.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              表示中の注文に明細がありません
            </p>
          ) : (
            <div className="max-h-[min(65dvh,560px)] overflow-auto rounded-md border border-border">
              <table className="w-full border-collapse text-left text-xs">
                <TableHeader className="sticky top-0 z-10 border-b border-border bg-muted/95 backdrop-blur-sm [&_tr]:border-b-0 [&_tr:hover]:bg-transparent">
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableHead className="h-8 whitespace-nowrap px-2 py-1.5 text-[11px] font-semibold">
                      日時
                    </TableHead>
                    <TableHead className="h-8 whitespace-nowrap px-2 py-1.5 text-[11px] font-semibold">
                      座席
                    </TableHead>
                    <TableHead className="h-8 min-w-0 px-2 py-1.5 text-[11px] font-semibold">
                      料理名
                    </TableHead>
                    <TableHead className="h-8 whitespace-nowrap px-2 py-1.5 text-right text-[11px] font-semibold tabular-nums">
                      個数
                    </TableHead>
                    <TableHead className="h-8 whitespace-nowrap px-2 py-1.5 text-[11px] font-semibold">
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
                        <TableCell className="whitespace-nowrap px-2 py-1.5 tabular-nums text-[11px] text-muted-foreground">
                          {formatJaCompact(row.created_at)}
                        </TableCell>
                        <TableCell
                          className="max-w-[5.5rem] truncate px-2 py-1.5 font-medium"
                          title={seatDisp}
                        >
                          {seatDisp}
                        </TableCell>
                        <TableCell
                          className="max-w-[min(42vw,11rem)] truncate px-2 py-1.5 font-medium"
                          title={line.name}
                        >
                          {line.name}
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums font-medium">
                          {line.qty}
                        </TableCell>
                        <TableCell className="min-w-[7.5rem] px-1 py-1">
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
                              <SelectTrigger className="h-8 w-full min-w-[6.75rem] gap-1 text-xs shadow-none ring-1 ring-border">
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
                            <span className="px-1 text-[11px] text-muted-foreground">
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
