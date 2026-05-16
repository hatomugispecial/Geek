"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  Search,
  Settings,
  Smartphone,
  Store,
  Tags,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  COMPANY,
  MOCK_ORDERS,
  type OrderRow,
  type OrderStatus,
} from "@/lib/orders-mock";

function statusVariant(
  status: OrderStatus,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "完了":
      return "secondary";
    case "受付済":
      return "outline";
    case "調理中":
      return "default";
    case "配達待ち":
      return "outline";
    default:
      return "outline";
  }
}

export function OrdersDashboard() {
  const [brand, setBrand] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState("today");
  const [kitchenNotify, setKitchenNotify] = React.useState(true);

  const filtered = React.useMemo(() => {
    return MOCK_ORDERS.filter((row) => {
      if (brand !== "all" && row.brand !== brand) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        row.id.toLowerCase().includes(q) ||
        row.store.toLowerCase().includes(q) ||
        row.items.toLowerCase().includes(q)
      );
    });
  }, [brand, query]);

  const displayRows = React.useMemo(() => {
    if (tab === "pending") {
      return filtered.filter((r) => r.status !== "完了");
    }
    return filtered;
  }, [filtered, tab]);

  const todayCount = MOCK_ORDERS.length;
  const pending = MOCK_ORDERS.filter((o) => o.status !== "完了").length;
  const directStores = 20;
  const franchiseStores = 80;

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent text-xs font-bold tracking-wide text-sidebar-accent-foreground">
              OD
            </div>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-xs font-semibold leading-tight">
                OSAKI ダイニング
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                注文オペレーション
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>メニュー</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive
                    tooltip="ダッシュボード"
                    render={<Link href="/store" />}
                  >
                    <LayoutDashboard />
                    <span>ダッシュボード</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="お客様注文（QR想定）"
                    render={<Link href="/Order" />}
                  >
                    <Smartphone />
                    <span>お客様注文</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="注文一覧">
                    <ClipboardList />
                    <span>注文一覧</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="店舗マスタ">
                    <Store />
                    <span>店舗マスタ</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="ブランド">
                    <Tags />
                    <span>ブランド</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="設定">
                    <Settings />
                    <span>設定</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border">
          <div className="px-2 py-2 text-[10px] leading-snug text-muted-foreground group-data-[collapsible=icon]:hidden">
            <p className="flex items-start gap-1">
              <MapPin className="mt-0.5 size-3 shrink-0" aria-hidden />
              <span>{COMPANY.address}</span>
            </p>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-6" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/store">ホーム</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>注文ダッシュボード</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-9 min-w-[44px] items-center gap-2 rounded-md px-2 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">運</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">運用 太郎</span>
                <ChevronDown className="size-4 opacity-60" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48 shadow-none ring-1 ring-border">
                <DropdownMenuLabel>アカウント</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>プロフィール</DropdownMenuItem>
                <DropdownMenuItem>通知設定</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>ログアウト</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
              注文ダッシュボード
            </h1>
            <p className="max-w-prose text-sm text-muted-foreground md:text-base">
              {COMPANY.name} — {COMPANY.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-none ring-1 ring-border">
              <CardHeader className="pb-2">
                <CardDescription>本日の注文件数</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {todayCount}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                全チャネル合算（モック）
              </CardContent>
            </Card>
            <Card className="shadow-none ring-1 ring-border">
              <CardHeader className="pb-2">
                <CardDescription>未完了オーダー</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{pending}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                完了以外のステータス
              </CardContent>
            </Card>
            <Card className="shadow-none ring-1 ring-border">
              <CardHeader className="pb-2">
                <CardDescription>直営店</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {directStores}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                店舗マスタ連携想定
              </CardContent>
            </Card>
            <Card className="shadow-none ring-1 ring-border">
              <CardHeader className="pb-2">
                <CardDescription>FC 加盟店</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {franchiseStores}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                オペレーション共通化
              </CardContent>
            </Card>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <TabsList>
                <TabsTrigger value="today">本日</TabsTrigger>
                <TabsTrigger value="pending">未完了</TabsTrigger>
                <TabsTrigger value="all">すべて</TabsTrigger>
              </TabsList>
              <div className="flex w-full flex-col gap-3 sm:max-w-md sm:flex-row sm:items-end">
                <div className="grid w-full gap-2 sm:flex-1">
                  <Label htmlFor="order-search" className="text-xs">
                    キーワード
                  </Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="order-search"
                      placeholder="注文ID・店舗・商品"
                      className="pl-9"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid w-full gap-2 sm:w-44">
                  <Label htmlFor="brand-filter" className="text-xs">
                    ブランド
                  </Label>
                  <Select
                    value={brand}
                    onValueChange={(v) => setBrand(v ?? "all")}
                  >
                    <SelectTrigger id="brand-filter" className="w-full">
                      <SelectValue placeholder="ブランド" />
                    </SelectTrigger>
                    <SelectContent className="shadow-none ring-1 ring-border">
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="OSAKI 亭">OSAKI 亭</SelectItem>
                      <SelectItem value="大崎グリル">大崎グリル</SelectItem>
                      <SelectItem value="品川そば処">品川そば処</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <OrderTable rows={displayRows} />
            </div>
          </Tabs>

          <Card className="shadow-none ring-1 ring-border">
            <CardHeader>
              <CardTitle className="text-base">店舗メモ（UI サンプル）</CardTitle>
              <CardDescription>
                Textarea・Switch・ボタン・セパレーターの使用例です。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="例：品川シーサイド店のピーク帯は12時前後。厨房ライン2本体制を推奨"
                className="min-h-[96px] min-w-[min(100%,320px)] resize-y"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={kitchenNotify}
                    onCheckedChange={setKitchenNotify}
                    id="kitchen-switch"
                  />
                  <Label htmlFor="kitchen-switch" className="text-sm font-normal">
                    厨房ダッシュボードに同時表示
                  </Label>
                </div>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Button type="button">メモを保存</Button>
                <Button type="button" variant="outline">
                  下書き
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function OrderTable({ rows }: { rows: OrderRow[] }) {
  return (
    <div className="rounded-xl border border-border bg-card ring-1 ring-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>注文ID</TableHead>
            <TableHead>日時</TableHead>
            <TableHead>ブランド</TableHead>
            <TableHead>店舗</TableHead>
            <TableHead>チャネル</TableHead>
            <TableHead className="min-w-[140px]">内容</TableHead>
            <TableHead className="text-right">金額</TableHead>
            <TableHead>ステータス</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-24 text-center text-muted-foreground"
              >
                該当する注文がありません
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.id}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.orderedAt}
                </TableCell>
                <TableCell>{row.brand}</TableCell>
                <TableCell>{row.store}</TableCell>
                <TableCell>{row.channel}</TableCell>
                <TableCell className="max-w-[220px] truncate">
                  {row.items}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  ¥{row.amount.toLocaleString("ja-JP")}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
