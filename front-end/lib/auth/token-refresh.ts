import type { JWT } from "next-auth/jwt";
import { refresh } from "@/features/auth/service/auth-api";

const REFRESH_SKEW_MS = 15_000;
const refreshFlights = new Map<string, Promise<JWT | null>>();

export function tokenNeedsRefresh(token: JWT, now = Date.now()): boolean {
  return !token.accessTokenExpiresAt || now >= token.accessTokenExpiresAt - REFRESH_SKEW_MS;
}

export function refreshAuthTokenSingleFlight(token: JWT): Promise<JWT | null> {
  if (!token.refreshToken) return Promise.resolve(null);

  const existing = refreshFlights.get(token.refreshToken);
  if (existing) return existing;

  const refreshToken = token.refreshToken;
  const flight = refresh(refreshToken)
    .then((tokens) => ({
      ...token,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      accessTokenExpiresAt: Date.now() + tokens.expires_in * 1000,
      error: undefined,
    }))
    .catch(() => null)
    .finally(() => refreshFlights.delete(refreshToken));

  refreshFlights.set(refreshToken, flight);
  return flight;
}
