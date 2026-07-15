import { backendFetch } from "./backend";
import {
  clearAuthToken,
  readAuthToken,
  refreshAuthTokenSingleFlight,
  tokenNeedsRefresh,
  writeAuthToken,
} from "../auth/authjs-jwt";

export async function authenticatedBackendFetch(request: Request, path: string, init: RequestInit = {}): Promise<Response> {
  let token = await readAuthToken(request);
  if (!token?.accessToken) return unauthorized();

  if (tokenNeedsRefresh(token)) {
    token = await refreshAuthTokenSingleFlight(token);
    if (!token?.accessToken) {
      await clearAuthToken(request);
      return unauthorized();
    }
    await writeAuthToken(request, token);
  }

  const first = await backendFetch(path, withBearer(init, token.accessToken));
  if (first.status !== 401) return first;

  const refreshed = await refreshAuthTokenSingleFlight(token);
  if (!refreshed?.accessToken) {
    await clearAuthToken(request);
    return unauthorized();
  }
  await writeAuthToken(request, refreshed);
  return backendFetch(path, withBearer(init, refreshed.accessToken));
}

function withBearer(init: RequestInit, accessToken: string): RequestInit {
  return { ...init, headers: { ...Object.fromEntries(new Headers(init.headers).entries()), Authorization: `Bearer ${accessToken}` } };
}

function unauthorized(): Response {
  return Response.json(
    { success: false, error: { code: "AUTHENTICATION_REQUIRED", message: "Authentication required" } },
    { status: 401, headers: { "X-Auth-Invalid": "1" } },
  );
}
