export function backendUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_BASE_URL is required");
  return new URL(path, base.endsWith("/") ? base : `${base}/`).toString();
}

export function jsonHeaders(extra?: HeadersInit): Record<string, string> {
  return { Accept: "application/json", "Content-Type": "application/json", ...Object.fromEntries(new Headers(extra).entries()) };
}

export function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(backendUrl(path), {
    ...init,
    headers: jsonHeaders(init.headers),
    cache: "no-store",
  });
}
