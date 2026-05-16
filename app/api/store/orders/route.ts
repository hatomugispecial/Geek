import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/auth/require-staff-api";
import { listOrdersForStoreFromEnv } from "@/lib/db/store-orders";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authResult = await requireStaffSession(request);
  if (!authResult.ok) return authResult.response;

  const { searchParams } = new URL(request.url);
  const seat = searchParams.get("seat") ?? undefined;

  const result = await listOrdersForStoreFromEnv(seat ?? undefined);
  if (!result.ok) {
    if (result.reason === "missing_env") {
      return NextResponse.json(
        {
          ok: false,
          code: "database_unconfigured",
          message: "DATABASE_URL が未設定です。",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      {
        ok: false,
        code: result.reason,
        message: result.message ?? "一覧の取得に失敗しました。",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    orders: result.orders,
    summary: result.summary,
    seatFilter: result.seatFilter,
  });
}
