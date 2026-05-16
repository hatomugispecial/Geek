import { NextResponse } from "next/server";
import { patchOrderStatusFromEnv } from "@/lib/db/store-orders";
import { isOrderFlowStatus } from "@/lib/store/order-flow";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_json", message: "JSON として解析できません。" },
      { status: 400 },
    );
  }

  const status =
    body && typeof body === "object" && "status" in body
      ? (body as { status?: unknown }).status
      : undefined;

  if (typeof status !== "string" || !isOrderFlowStatus(status)) {
    return NextResponse.json(
      {
        ok: false,
        code: "invalid_status",
        message:
          "status は pending / cooking / ready / served / cancelled のいずれかを指定してください。",
      },
      { status: 400 },
    );
  }

  const result = await patchOrderStatusFromEnv(id, status);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, code: result.code, message: result.message },
      { status: result.httpStatus },
    );
  }

  return NextResponse.json({ ok: true });
}
