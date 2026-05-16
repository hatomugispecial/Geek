"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  Settings,
  Smartphone,
  Store,
  Tags,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { COMPANY } from "@/lib/orders-mock";
import { StoreOrdersReception } from "@/components/store/store-orders-reception";

export function OrdersDashboard() {
  const [kitchenNotify, setKitchenNotify] = React.useState(true);

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
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight">受信注文（Neon）</h2>
            <p className="max-w-prose text-sm text-muted-foreground">
              客向け <code className="rounded bg-muted px-1">/Order</code> から送信された注文を一覧し、ステータスを更新できます。座席番号でメニュー別の数量・金額と合計を確認できます。
            </p>
          </div>
          <StoreOrdersReception />

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
