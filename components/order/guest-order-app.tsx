"use client";

import * as React from "react";
import Image from "next/image";
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
  MENU_CATEGORY_ORDER,
  MENU_ITEMS,
  MENU_TABS,
  menuImageUrlForId,
  type MenuCategoryId,
  type MenuItem,
  type MenuTabId,
} from "@/lib/order/menu-data";
import { cn } from "@/lib/utils";

type BottomPanel = "history" | "cart" | "checkout" | null;

type HistoryLine = {
  id: string;
  menuId: string;
  name: string;
  qty: number;
  unitPrice: number;
  imageUrl: string;
};

const QTY_OPTIONS = ["0", "1", "2", "3", "4"] as const;

function itemsByCategory(categoryId: MenuCategoryId): MenuItem[] {
  return MENU_ITEMS.filter((i) => i.categoryId === categoryId);
}

function LineThumb({ src, label }: { src: string; label: string }) {
  return (
    <div className="relative size-11 shrink-0 overflow-hidden rounded-md border border-orange-200/50 bg-orange-50/30 ring-1 ring-orange-100/50">
      <Image
        src={src}
        alt=""
        fill
        sizes="44px"
        className="object-cover"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

function MenuItemCard({
  item,
  onSelect,
}: {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item)}
        className={cn(
          "group flex w-full flex-col overflow-hidden rounded-xl border border-orange-200/45 bg-[#fffbf7] text-left ring-1 ring-orange-100/40 transition-colors",
          "min-h-[44px] hover:border-orange-300/60 hover:bg-[#fff8f0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600/40",
        )}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-orange-50/40">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 430px) 45vw, 200px"
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-2.5">
          <span className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-stone-900 sm:text-base">
            {item.name}
          </span>
          <span className="text-sm font-semibold tabular-nums tracking-tight text-orange-950 sm:text-base">
            ¥{item.price.toLocaleString("ja-JP")}
          </span>
        </div>
      </button>
    </li>
  );
}

export function GuestOrderApp() {
  const [tab, setTab] = React.useState<MenuTabId>("all");
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
      menuId: item.id,
      name: item.name,
      qty,
      unitPrice: item.price,
      imageUrl: item.imageUrl,
    }));
    setHistory((prev) => [...prev, ...newLines]);
    setCart({});
    setPanel(null);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[#f4efe6]">
      <header className="sticky top-0 z-20 border-b border-stone-300/40 bg-[#f4efe6]/95 px-4 py-3 backdrop-blur-sm">
        <p className="text-[10px] font-medium tracking-wide text-stone-600">
          株式会社 OSAKI ダイニング（架空）
        </p>
        <h1 className="text-lg font-semibold tracking-wide text-stone-900">
          {GUEST_STORE_NAME}
        </h1>
      </header>

      <div className="flex-1 px-3 pb-28 pt-3">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab((v as MenuTabId) ?? "all")}
          className="gap-0"
        >
          <div className="-mx-1 overflow-x-auto overscroll-x-contain pb-2">
            <TabsList
              variant="line"
              className="mb-1 inline-flex h-auto min-w-max gap-0.5 bg-transparent px-1 py-0"
            >
              {MENU_TABS.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="shrink-0 rounded-md px-2.5 py-2 text-xs text-stone-700 transition-colors data-active:shadow-none data-active:bg-orange-100/85 data-active:text-orange-950 data-active:ring-1 data-active:ring-orange-200/50 sm:text-sm"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {MENU_TABS.map((t) => (
            <TabsContent
              key={t.id}
              value={t.id}
              className="mt-0 outline-none focus-visible:outline-none"
            >
              {t.id === "all" ? (
                <div className="flex flex-col gap-8">
                  {MENU_CATEGORY_ORDER.map((cat) => (
                    <section
                      key={cat.id}
                      className="scroll-mt-4"
                      aria-labelledby={`cat-${cat.id}`}
                    >
                      <h2
                        id={`cat-${cat.id}`}
                        className="border-b border-orange-200/40 border-l-[3px] border-l-orange-500/55 pb-1.5 pl-2 text-sm font-semibold tracking-wide text-stone-900"
                      >
                        {cat.label}
                      </h2>
                      <ul className="mt-3 grid grid-cols-2 gap-3">
                        {itemsByCategory(cat.id).map((item) => (
                          <MenuItemCard
                            key={item.id}
                            item={item}
                            onSelect={openItem}
                          />
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              ) : (
                <section
                  className="scroll-mt-4"
                  aria-labelledby={`cat-${t.id}`}
                >
                  <h2
                    id={`cat-${t.id}`}
                    className="border-b border-orange-200/40 border-l-[3px] border-l-orange-500/55 pb-1.5 pl-2 text-sm font-semibold tracking-wide text-stone-900"
                  >
                    {t.label}
                  </h2>
                  <ul className="mt-3 grid grid-cols-2 gap-3">
                    {itemsByCategory(t.id).map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onSelect={openItem}
                      />
                    ))}
                  </ul>
                </section>
              )}
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
          className="max-w-[min(100%,360px)] border-orange-100/60 bg-[#fffbf7] shadow-none ring-1 ring-orange-200/40"
          showCloseButton
        >
          {activeItem ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl text-stone-900 sm:text-2xl">
                  {activeItem.name}
                </DialogTitle>
                <DialogDescription className="space-y-1 text-base font-semibold tabular-nums text-orange-950 sm:text-lg">
                  <span>
                    単価 ¥{activeItem.price.toLocaleString("ja-JP")}
                  </span>
                  <span className="block text-sm font-normal text-stone-600">
                    税込想定
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="relative mx-auto h-40 w-full max-w-[220px] overflow-hidden rounded-xl border border-orange-200/50 bg-orange-50/40 ring-1 ring-orange-100/50">
                <Image
                  src={activeItem.imageUrl}
                  alt={activeItem.name}
                  fill
                  sizes="220px"
                  className="object-cover"
                />
              </div>
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
                <Button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-orange-600 text-white hover:bg-orange-700"
                  onClick={addFromDialog}
                >
                  <svg
                    className="size-5 shrink-0 fill-current"
                    viewBox="0 0 20 20"
                    aria-hidden
                  >
                    <path d="M10 3.5a1 1 0 0 1 1 1V9h4.5a1 1 0 1 1 0 2H11v4.5a1 1 0 1 1-2 0V11H4.5a1 1 0 1 1 0-2H9V4.5a1 1 0 0 1 1-1Z" />
                  </svg>
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
          className="mx-auto flex max-h-[85dvh] w-full max-w-[430px] flex-col rounded-t-xl border-x-0 border-t border-orange-200/35 bg-[#fdfbf7] p-0 shadow-none ring-1 ring-orange-200/35"
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
                        className="flex items-center gap-3 py-3 text-sm"
                      >
                        <LineThumb
                          src={row.imageUrl ?? menuImageUrlForId(row.menuId)}
                          label={row.name}
                        />
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {row.name}
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          ×{row.qty}
                        </span>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-orange-950">
                          ¥{(row.unitPrice * row.qty).toLocaleString("ja-JP")}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </ScrollArea>
              <div className="border-t border-orange-200/40 bg-orange-50/60 px-4 py-3">
                <div className="flex items-center justify-between text-base font-semibold text-stone-900">
                  <span>総額</span>
                  <span className="tabular-nums text-orange-950">
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
                        className="flex items-center gap-3 py-3 text-sm"
                      >
                        <LineThumb src={item.imageUrl} label={item.name} />
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {item.name}
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          ×{qty}
                        </span>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-orange-950">
                          ¥{(item.price * qty).toLocaleString("ja-JP")}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </ScrollArea>
              <div className="border-t border-orange-200/40 bg-orange-50/60 px-4 py-3">
                <div className="flex items-center justify-between text-base font-semibold text-stone-900">
                  <span>小計</span>
                  <span className="tabular-nums text-orange-950">
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
                        className="flex items-center gap-3 py-3 text-sm"
                      >
                        <LineThumb src={item.imageUrl} label={item.name} />
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {item.name}
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          ×{qty}
                        </span>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-orange-950">
                          ¥{(item.price * qty).toLocaleString("ja-JP")}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </ScrollArea>
              <SheetFooter className="border-t border-orange-200/40 bg-orange-50/50 px-4 py-3 sm:flex-col">
                <div className="mb-3 flex w-full items-center justify-between text-base font-semibold text-stone-900">
                  <span>お支払い予定（参考）</span>
                  <span className="tabular-nums text-orange-950">
                    ¥{cartSubtotal.toLocaleString("ja-JP")}
                  </span>
                </div>
                <Button
                  type="button"
                  className="w-full rounded-[14px] bg-red-600 py-6 text-base font-semibold text-white hover:bg-red-700"
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
        className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[430px] -translate-x-1/2 border-t border-stone-300/50 bg-[#ebe4d9] pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-0 shadow-none ring-1 ring-stone-300/40"
        aria-label="注文アクション"
      >
        <div className="grid w-full grid-cols-3">
          <button
            type="button"
            className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 border-r border-stone-300/40 px-1 py-2 text-[11px] font-medium leading-tight text-stone-800 transition-colors hover:bg-stone-200/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-stone-500 sm:text-xs"
            onClick={() => setPanel("history")}
          >
            今までの
            <br className="sm:hidden" />
            注文履歴
          </button>
          <button
            type="button"
            className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 border-r border-amber-300/50 bg-amber-100 px-1 py-2 text-[11px] font-semibold leading-tight text-amber-950 transition-colors hover:bg-amber-200/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-amber-700 sm:text-xs"
            onClick={() => setPanel("cart")}
          >
            現在の
            <br className="sm:hidden" />
            カート
          </button>
          <button
            type="button"
            className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 bg-red-600 px-1 py-2 text-[11px] font-semibold leading-tight text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-red-800 sm:text-xs"
            onClick={() => setPanel("checkout")}
          >
            注文する
          </button>
        </div>
      </nav>
    </div>
  );
}
