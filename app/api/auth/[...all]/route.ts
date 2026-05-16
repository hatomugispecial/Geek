import { toNextJsHandler } from "better-auth/next-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AuthHandlers = ReturnType<typeof toNextJsHandler>;

let cachedHandlers: AuthHandlers | null = null;

async function getHandlers(): Promise<AuthHandlers> {
  if (cachedHandlers) return cachedHandlers;
  const { auth } = await import("@/lib/auth");
  cachedHandlers = toNextJsHandler(auth);
  return cachedHandlers;
}

function bootstrapErrorResponse(err: unknown): Response {
  const message =
    err instanceof Error ? err.message : typeof err === "string" ? err : "不明なエラー";
  return Response.json(
    {
      code: "AUTH_BOOTSTRAP_FAILED",
      message:
        "認証の初期化に失敗しました。Vercel の Production に DATABASE_URL（または POSTGRES_URL 等）と BETTER_AUTH_SECRET（32文字以上）・BETTER_AUTH_URL を設定してください。",
      cause: message,
    },
    { status: 503 },
  );
}

async function handle(
  method: keyof AuthHandlers,
  req: Request,
): Promise<Response> {
  try {
    const h = await getHandlers();
    const fn = h[method] as (r: Request) => Promise<Response> | Response;
    return await fn(req);
  } catch (err) {
    console.error("[api/auth]", method, err);
    return bootstrapErrorResponse(err);
  }
}

export function GET(req: Request) {
  return handle("GET", req);
}
export function POST(req: Request) {
  return handle("POST", req);
}
export function PATCH(req: Request) {
  return handle("PATCH", req);
}
export function PUT(req: Request) {
  return handle("PUT", req);
}
export function DELETE(req: Request) {
  return handle("DELETE", req);
}
