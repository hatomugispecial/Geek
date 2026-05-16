import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireStaffSession(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          ok: false,
          code: "unauthorized",
          message: "店舗向け API にはログインが必要です。",
        },
        { status: 401 },
      ),
    };
  }
  return { ok: true as const, session };
}
