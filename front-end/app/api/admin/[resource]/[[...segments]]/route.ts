import { NextResponse } from "next/server";
import { authenticatedBackendFetch } from "@/lib/api/authenticated-backend";
import { resolveAdminEndpoint } from "@/lib/api/admin-route";

type Context = { params: Promise<{ resource: string; segments?: string[] }> };

async function forward(request: Request, context: Context) {
  const { resource, segments = [] } = await context.params;
  let path: string;
  try { path = resolveAdminEndpoint(resource, segments, request.method); }
  catch { return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Endpoint not found" } }, { status: 404 }); }
  const query = new URL(request.url).search;
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.text();
  try {
    const upstream = await authenticatedBackendFetch(request, `${path}${query}`, { method: request.method, body });
    return new NextResponse(upstream.body, { status: upstream.status, headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "SERVICE_UNAVAILABLE", message: "Backend service unavailable" } }, { status: 503 });
  }
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
