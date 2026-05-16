"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GUEST_STORE_NAME,
  MENU_CATEGORIES,
  MENU_ITEMS,
  type MenuCategoryId,
  type MenuItem,
} from "@/lib/order/menu-data";
import { cn } from "@/lib/utils";

type BottomPanel = "history" | "cart" | "checkout" | null;

type HistoryLine = {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
};

const QTY_OPTIONS = ["0", "1", "2", "3", "4"] as const;

function itemsByCategory(categoryId: MenuCategoryId): MenuItem[] {
  return MENU_ITEMS.filter((i) => i.categoryId === categoryId);
}

export function GuestOrderApp() {
  const [category, setCategory] = React.useState<MenuCategoryId>("otsumami");
  const [cart, setCart] = React.useState<Record<string, number>>({});
  const [history, setHistory] = React.useState<HistoryLine[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState<MenuItem | null>(null);
  const [dialogQty, setDialogQty] = React.useState("1");
  const [panel, setPanel] = React.useState<BottomPanel>(null);

  React.useEffect(() => {
    if (activeItem) setDialogQty("1");
  }, [activeItem]);

  const openItem = (item: MenuItem) => {
    setActiveItem(item);
    setDialogOpen(true);
  };

  const addFromDialog = () => {
    if (!activeItem) return;
    const n = Number.parseInt(dialogQty, 10);
    if (Number.isNaN(n) || n < 0 || n > 4) return;
    setCart((prev) => {
      const next = { ...prev };
      if (n === 0) {
        delete next[activeItem.id];
        return next;
      }
      next[activeItem.id] = (next[activeItem.id] ?? 0) + n;
      return next;
    });
    setDialogOpen(false);
    setActiveItem(null);
  };

  const cartLines = React.useMemo(() => {
    return Object.entries(cart)
      .map(([menuId, qty]) => {
        const item = MENU_ITEMS.find((m) => m.id === menuId);
        if (!item || qty <= 0) return null;
        return { item, qty };
      })
      .filter(Boolean) as { item: MenuItem; qty: number }[];
  }, [cart]);

  const cartSubtotal = React.useMemo(() => {
    return cartLines.reduce((s, l) => s + l.item.price * l.qty, 0);
  }, [cartLines]);

  const historyTotal = React.useMemo(() => {
    return history.reduce((s, h) => s + h.unitPrice * h.qty, 0);
  }, [history]);

  const confirmOrder = () => {
    if (cartLines.length === 0) return;
    const newLines: HistoryLine[] = cartLines.map(({ item, qty }) => ({
      id: crypto.randomUUID(),
      name: item.name,
      qty,
      unitPrice: item.price,
    }));
    setHistory((prev) => [...prev, ...newLines]);
    setCart({});
    setPanel(null);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 px-4 py-3 backdrop-blur-sm">
        <p className="text-[10px] font-medium tracking-wide text-muted-foreground">
          株式会社 OSAKI ダイニング（架空）
        </p>
        <h1 className="text-lg font-semibold tracking-wide">{GUEST_STORE_NAME}</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          テーブル QR 想定・430px 幅で表示最適化
        </p>
      </header>

      <div className="flex-1 px-3 pb-28 pt-3">
        <Tabs
          value={category}
          onValueChange={(v) => setCategory((v as MenuCategoryId) ?? "otsumami")}
          className="gap-0"
        >
          <div className="-mx-1 overflow-x-auto overscroll-x-contain pb-2">
            <TabsList
              variant="line"
              className="mb-1 inline-flex h-auto min-w-max gap-0.5 bg-transparent px-1 py-0"
            >
              {MENU_CATEGORIES.map((c) => (
                <TabsTrigger
                  key={c.id}
                  value={c.id}
                  className="shrink-0 rounded-md px-2.5 py-2 text-xs data-active:shadow-none sm:text-sm"
                >
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {MENU_CATEGORIES.map((c) => (
            <TabsContent
              key={c.id}
              value={c.id}
              className="mt-0 outline-none focus-visible:outline-none"
            >
              <ul className="grid grid-cols-2 gap-3">
                {itemsByCategory(c.id).map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => openItem(item)}
                      className={cn(
                        "flex w-full flex-col overflow-hidden rounded-lg border bg-card text-left ring-1 ring-border transition-colors",
                        "min-h-[44px] hover:bg-muted/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      )}
                    >
                      <div className="aspect-square w-full bg-muted">
                        <div className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] leading-tight text-muted-foreground">
                          写真
                          <br />
                          準備中
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-1 p-2">
                        <span className="line-clamp-2 text-xs font-medium leading-snug">
                          {item.name}
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          ¥{item.price.toLocaleString("ja-JP")}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setActiveItem(null);
        }}
      >
        <DialogContent
          className="max-w-[min(100%,360px)] shadow-none ring-1 ring-border"
          showCloseButton
        >
          {activeItem ? (
            <>
              <DialogHeader>
                <DialogTitle>{activeItem.name}</DialogTitle>
                <DialogDescription>
                  単価 ¥{activeItem.price.toLocaleString("ja-JP")}（税込想定）
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2 py-2">
                <Label htmlFor="qty-select" className="text-xs">
                  数量（0〜4）
                </Label>
                <Select value={dialogQty} onValueChange={(v) => setDialogQty(v ?? "1")}>
                  <SelectTrigger id="qty-select" className="w-full shadow-none ring-1 ring-border">
                    <SelectValue placeholder="数量" />
                  </SelectTrigger>
                  <SelectContent className="shadow-none ring-1 ring-border">
                    {QTY_OPTIONS.map((q) => (
                      <SelectItem key={q} value={q}>
                        {q}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  0 を選んで「追加」するとカートから削除します。
                </p>
              </div>
              <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  キャンセル
                </Button>
                <Button type="button" onClick={addFromDialog}>
                  追加
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Sheet
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="mx-auto flex max-h-[85dvh] w-full max-w-[430px] flex-col rounded-t-xl border-x-0 border-t p-0 shadow-none ring-1 ring-border"
        >
          {panel === "history" ? (
            <>
              <SheetHeader className="border-b px-4 py-3 text-left">
                <SheetTitle>今までの注文履歴</SheetTitle>
                <SheetDescription>
                  確定済みの注文の合算です（この端末内のみ）。
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="min-h-0 flex-1 px-2">
                <ul className="divide-y px-2">
                  {history.length === 0 ? (
                    <li className="py-8 text-center text-sm text-muted-foreground">
                      まだ注文履歴がありません
                    </li>
                  ) : (
                    history.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-center justify-between gap-2 py-3 text-sm"
                      >
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {row.name}
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          ×{row.qty}
                        </span>
                        <span className="shrink-0 tabular-nums">
                          ¥{(row.unitPrice * row.qty).toLocaleString("ja-JP")}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </ScrollArea>
              <div className="border-t bg-muted/30 px-4 py-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>総額</span>
                  <span className="tabular-nums">
                    ¥{historyTotal.toLocaleString("ja-JP")}
                  </span>
                </div>
              </div>
            </>
          ) : null}

          {panel === "cart" ? (
            <>
              <SheetHeader className="border-b px-4 py-3 text-left">
                <SheetTitle>現在のカート</SheetTitle>
                <SheetDescription>
                  「注文する」から確定すると履歴に反映されます。
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="min-h-0 flex-1 px-2">
                <ul className="divide-y px-2">
                  {cartLines.length === 0 ? (
                    <li className="py-8 text-center text-sm text-muted-foreground">
                      カートは空です
                    </li>
                  ) : (
                    cartLines.map(({ item, qty }) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-2 py-3 text-sm"
                      >
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {item.name}
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          ×{qty}
                        </span>
                        <span className="shrink-0 tabular-nums">
                          ¥{(item.price * qty).toLocaleString("ja-JP")}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </ScrollArea>
              <div className="border-t bg-muted/30 px-4 py-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>小計</span>
                  <span className="tabular-nums">
                    ¥{cartSubtotal.toLocaleString("ja-JP")}
                  </span>
                </div>
              </div>
            </>
          ) : null}

          {panel === "checkout" ? (
            <>
              <SheetHeader className="border-b px-4 py-3 text-left">
                <SheetTitle>注文する</SheetTitle>
                <SheetDescription>
                  内容を確認のうえ、注文を確定してください。
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="min-h-0 flex-1 px-2">
                <ul className="divide-y px-2">
                  {cartLines.length === 0 ? (
                    <li className="py-8 text-center text-sm text-muted-foreground">
                      カートに商品がありません
                    </li>
                  ) : (
                    cartLines.map(({ item, qty }) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-2 py-3 text-sm"
                      >
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {item.name}
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          ×{qty}
                        </span>
                        <span className="shrink-0 tabular-nums">
                          ¥{(item.price * qty).toLocaleString("ja-JP")}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </ScrollArea>
              <SheetFooter className="border-t bg-background px-4 py-3 sm:flex-col">
                <div className="mb-3 flex w-full items-center justify-between text-sm font-semibold">
                  <span>お支払い予定（参考）</span>
                  <span className="tabular-nums">
                    ¥{cartSubtotal.toLocaleString("ja-JP")}
                  </span>
                </div>
                <Button
                  type="button"
                  className="w-full rounded-[14px] py-6 text-base"
                  disabled={cartLines.length === 0}
                  onClick={confirmOrder}
                >
                  注文を確定
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <nav
        className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[430px] -translate-x-1/2 border-t bg-background pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-none ring-1 ring-border"
        aria-label="注文アクション"
      >
        <div className="grid w-full grid-cols-3 divide-x divide-border">
          <button
            type="button"
            className="flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium leading-tight text-foreground hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:text-xs"
            onClick={() => setPanel("history")}
          >
            今までの
            <br className="sm:hidden" />
            注文履歴
          </button>
          <button
            type="button"
            className="flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium leading-tight text-foreground hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:text-xs"
            onClick={() => setPanel("cart")}
          >
            現在の
            <br className="sm:hidden" />
            カート
          </button>
          <button
            type="button"
            className="flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium leading-tight text-foreground hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:text-xs"
            onClick={() => setPanel("checkout")}
          >
            注文する
          </button>
        </div>
      </nav>
    </div>
  );
}
