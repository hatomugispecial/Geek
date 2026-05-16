import type { Metadata } from "next";
import { SeatOrderLanding } from "@/components/order/seat-order-landing";

export const metadata: Metadata = {
  title: "座席を選ぶ | テーブル注文 | OSAKI 亭",
  description:
    "株式会社 OSAKI ダイニング（架空）の店舗向けモバイル注文画面（QR 想定）です。",
};

export default function OrderPage() {
  return <SeatOrderLanding />;
}
