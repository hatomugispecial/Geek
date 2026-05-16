import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * 店舗ルートの軽いガード（Cookie の有無のみ）。
 * `auth.api.getSession` は nextCookies が `cookies()` を呼び、Next.js の proxy では例外になり得るため使わない。
 * 実際のセッション検証は `app/store/page.tsx` と `/api/store/*` で行う。
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/store") || pathname.startsWith("/api/store")) {
    const sessionToken = getSessionCookie(request);
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "callbackUrl",
        `${pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/store", "/store/:path*", "/api/store/:path*"],
};
