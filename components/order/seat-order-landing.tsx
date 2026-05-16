"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GUEST_STORE_NAME } from "@/lib/order/menu-data";

const SEAT_MAX_LEN = 64;

export function SeatOrderLanding() {
  const router = useRouter();
  const [seat, setSeat] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const go = () => {
    const t = seat.trim();
    if (!t) {
      setError("座席番号を入力してください。");
      return;
    }
    if (t.length > SEAT_MAX_LEN) {
      setError(`座席番号は${SEAT_MAX_LEN}文字以内で入力してください。`);
      return;
    }
    if (/[\u0000-\u001F]/.test(t)) {
      setError("座席番号に使用できない文字が含まれています。");
      return;
    }
    setError(null);
    router.push(`/Order/${encodeURIComponent(t)}`);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[#f4efe6]">
      <header className="border-b border-stone-300/40 bg-[#f4efe6]/95 px-4 py-3">
        <p className="text-[10px] font-medium tracking-wide text-stone-600">
          株式会社 OSAKI ダイニング（架空）
        </p>
        <h1 className="text-lg font-semibold tracking-wide text-stone-900">
          {GUEST_STORE_NAME}
        </h1>
      </header>

      <main className="flex flex-1 flex-col px-4 py-6">
        <div className="rounded-xl border border-orange-200/50 bg-[#fffbf7] p-4 ring-1 ring-orange-100/50">
          <h2 className="text-base font-semibold tracking-wide text-stone-900">
            座席番号を入力
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            まずお席の番号（またはテーブル名）を入力してから、メニュー画面へ進みます。席が違うと注文内容は共有されません。
          </p>
          <div className="mt-4 grid gap-2">
            <Label htmlFor="seat-landing" className="text-xs font-medium text-stone-800">
              座席番号
            </Label>
            <Input
              id="seat-landing"
              value={seat}
              onChange={(e) => {
                setSeat(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  go();
                }
              }}
              placeholder="例：テーブル5"
              maxLength={SEAT_MAX_LEN}
              className="min-h-10 w-full min-w-[min(100%,320px)] border-orange-200/60"
              autoComplete="off"
              inputMode="text"
            />
          </div>
          {error ? (
            <p
              role="alert"
              className="mt-3 rounded-md border border-red-300/60 bg-red-50/90 p-2.5 text-xs leading-relaxed text-red-950"
            >
              {error}
            </p>
          ) : null}
          <Button
            type="button"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-orange-600 py-6 text-base font-semibold text-white hover:bg-orange-700"
            onClick={go}
          >
            <svg
              className="size-5 shrink-0 fill-current"
              viewBox="0 0 20 20"
              aria-hidden
            >
              <path d="M10.75 4.5a.75.75 0 0 0-1.5 0v4.25H5a.75.75 0 0 0 0 1.5h4.25V14a.75.75 0 0 0 1.5 0v-4.25H14a.75.75 0 0 0 0-1.5h-4.25V4.5Z" />
            </svg>
            この席で注文を始める
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-stone-600">
          <Link
            href="/"
            className="font-medium text-orange-900 underline underline-offset-2 hover:text-orange-950"
          >
            サイトトップへ
          </Link>
        </p>
      </main>
    </div>
  );
}
