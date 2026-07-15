import { cookies } from "next/headers";
import { encode, getToken, type JWT } from "next-auth/jwt";
import { refreshAuthTokenSingleFlight, tokenNeedsRefresh } from "./token-refresh";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required");
  return secret;
}

function authJsCookieName(request: Request): string {
  const cookieHeader = request.headers.get("cookie") ?? "";
  return cookieHeader.includes("__Secure-authjs.session-token=")
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
}

export async function readAuthToken(request: Request): Promise<JWT | null> {
  const cookieName = authJsCookieName(request);
  return getToken({ req: request, secret: authSecret(), salt: cookieName, cookieName });
}

export { refreshAuthTokenSingleFlight, tokenNeedsRefresh };

export async function writeAuthToken(request: Request, token: JWT): Promise<void> {
  const cookieName = authJsCookieName(request);
  const value = await encode({ token, secret: authSecret(), salt: cookieName, maxAge: SESSION_MAX_AGE });
  const store = await cookies();
  store.set(cookieName, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieName.startsWith("__Secure-"),
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearAuthToken(request: Request): Promise<void> {
  const store = await cookies();
  store.set(authJsCookieName(request), "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}
