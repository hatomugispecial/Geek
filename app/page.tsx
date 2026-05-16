"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-6 bg-background px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="space-y-2 text-left">
        <p className="text-xs font-medium tracking-wide text-muted-foreground">
          株式会社 OSAKI ダイニング（架空）
        </p>
        <h1 className="text-xl font-semibold tracking-tight">
          オーダーシステム入口
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          QR から開くお客様画面と、店舗運用コンソール（デモ）へのリンクです。
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Button
          render={<Link href="/Order" />}
          size="lg"
          className="h-12 w-full justify-center rounded-[14px] text-base"
        >
          お客様用メニュー・注文
        </Button>
        <Button
          render={<Link href="/store" />}
          variant="outline"
          size="lg"
          className="h-12 w-full justify-center rounded-[14px] text-base"
        >
          店舗コンソール（デモ）
        </Button>
      </div>
      <Card className="shadow-none ring-1 ring-border">
        <CardHeader>
          <CardTitle className="text-base">ディレクトリ構成</CardTitle>
          <CardDescription className="text-left text-xs leading-relaxed">
            客向け注文は <code className="rounded bg-muted px-1">/Order</code>
            、店舗 UI は <code className="rounded bg-muted px-1">/store</code>
            。リポジトリ直下の <code className="rounded bg-muted px-1">Store/</code>{" "}
            と <code className="rounded bg-muted px-1">Backend/</code> は
            Direction.md の将来用プレースホルダです。
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
