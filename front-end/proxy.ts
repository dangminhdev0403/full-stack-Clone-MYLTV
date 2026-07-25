import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { safeCallbackUrl } from "@/lib/auth/callback-url";
import { isUsableAuthToken } from "@/lib/auth/session-validity";

function getCookieName(request: import("next/server").NextRequest): string {
  const cookieHeader = request.headers.get("cookie") ?? "";
  if (cookieHeader.includes("__Secure-authjs.session-token=")) {
    return "__Secure-authjs.session-token";
  }
  if (cookieHeader.includes("__Secure-next-auth.session-token=")) {
    return "__Secure-next-auth.session-token";
  }
  if (cookieHeader.includes("next-auth.session-token=")) {
    return "next-auth.session-token";
  }
  return "authjs.session-token";
}

export default async function proxy(request: import("next/server").NextRequest) {
  const cookieName = getCookieName(request);
  const isSecure =
    request.headers.get("x-forwarded-proto") === "https" ||
    request.nextUrl.protocol === "https:" ||
    cookieName.startsWith("__Secure-");

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    salt: cookieName,
    cookieName,
    secureCookie: isSecure,
  });

  const isAuthenticated = isUsableAuthToken(token);
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin") && !isAuthenticated) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", safeCallbackUrl(`${pathname}${search}`));
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(
      new URL(
        safeCallbackUrl(request.nextUrl.searchParams.get("callbackUrl")),
        request.nextUrl
      )
    );
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/login"] };

