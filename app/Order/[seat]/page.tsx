import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GuestOrderApp } from "@/components/order/guest-order-app";

const SEAT_MAX_LEN = 64;

function parseSeat(raw: string): string | null {
  let s = raw;
  try {
    s = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const t = s.trim();
  if (!t || t.length > SEAT_MAX_LEN) return null;
  if (/[\u0000-\u001F]/.test(t)) return null;
  return t;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ seat: string }>;
}): Promise<Metadata> {
  const { seat: raw } = await params;
  const seat = parseSeat(raw);
  const label = seat ?? "座席";
  return {
    title: `${label} | テーブル注文 | OSAKI 亭`,
    description:
      "株式会社 OSAKI ダイニング（架空）の店舗向けモバイル注文画面（QR 想定）です。",
  };
}

export default async function OrderSeatPage({
  params,
}: {
  params: Promise<{ seat: string }>;
}) {
  const { seat: raw } = await params;
  const seat = parseSeat(raw);
  if (!seat) redirect("/Order");
  return <GuestOrderApp seatCode={seat} />;
}
