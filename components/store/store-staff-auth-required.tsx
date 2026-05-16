"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 店舗 API が 401 を返したときに表示する「ログインへ」導線。
 */
export function StoreStaffAuthRequired() {
  const pathname = usePathname();
  const callbackUrl = pathname?.startsWith("/") ? pathname : "/store";

  const href = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <div
      className="mx-auto flex w-full max-w-lg flex-col justify-center gap-6 px-4 py-12 text-left sm:py-16"
      role="alert"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          認証の確認が必要です
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          店舗コンソールの操作にはログインが必要です。セッションの有効期限が切れている場合は、再度ログインしてください。
        </p>
      </div>
      <div className="rounded-sm border border-border bg-card p-5 ring-1 ring-border">
        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: "default" }),
            "inline-flex h-12 min-h-12 w-full items-center justify-center gap-2 rounded-[10px] text-base font-medium hover:bg-primary/90",
          )}
        >
          <LogIn className="size-5 shrink-0" aria-hidden />
          ログイン画面を開く
        </Link>
      </div>
    </div>
  );
}
