import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { safeCallbackUrl } from "@/lib/auth/callback-url";
import { isUsableAuthToken } from "@/lib/auth/session-validity";

export default async function proxy(request: import("next/server").NextRequest) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  const isAuthenticated = isUsableAuthToken(token);
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin") && !isAuthenticated) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", safeCallbackUrl(`${pathname}${search}`));
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL(safeCallbackUrl(request.nextUrl.searchParams.get("callbackUrl")), request.nextUrl));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/login"] };
