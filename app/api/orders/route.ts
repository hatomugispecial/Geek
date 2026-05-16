import { NextResponse } from "next/server";
import { getNeonSql } from "@/lib/db/neon";
import { createOrderInDb } from "@/lib/orders/create-order";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_json", message: "JSON として解析できません。" },
      { status: 400 },
    );
  }

  const sql = getNeonSql();
  if (!sql) {
    return NextResponse.json(
      {
        ok: false,
        code: "database_unconfigured",
        message:
          "サーバーに DATABASE_URL が設定されていません。Neon の接続文字列を環境変数に設定してください。",
      },
      { status: 503 },
    );
  }

  const result = await createOrderInDb(sql, body);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, code: result.code, message: result.message },
      { status: result.httpStatus },
    );
  }

  return NextResponse.json({
    ok: true,
    orderId: result.orderId,
  });
}
