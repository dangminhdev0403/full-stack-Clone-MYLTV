import { NextResponse } from "next/server";

const ALLOWED_LEVELS = new Set(["info", "error"]);

type AdminManagementLogPayload = {
  level?: string;
  message?: string;
  fields?: Record<string, unknown>;
};

export async function POST(request: Request) {
  let payload: AdminManagementLogPayload;

  try {
    payload = (await request.json()) as AdminManagementLogPayload;
  } catch {
    console.error("[admin-management-api] invalid log payload", {
      scope: "admin-management-api",
      event: "log_rejected",
      reason: "invalid_json",
    });
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const level = ALLOWED_LEVELS.has(payload.level ?? "") ? payload.level : "info";
  const message = typeof payload.message === "string" && payload.message.trim() ? payload.message : "[admin-management-api] client event";
  const fields = sanitizeLogFields(payload.fields);

  if (level === "error") {
    console.error(message, fields);
  } else {
    console.info(message, fields);
  }

  return NextResponse.json({ ok: true });
}

function sanitizeLogFields(fields: unknown) {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    return { scope: "admin-management-api" };
  }

  const source = fields as Record<string, unknown>;
  return {
    scope: "admin-management-api",
    method: stringify(source.method),
    url: stringify(source.url),
    path: stringify(source.path),
    durationMs: numberOrUndefined(source.durationMs),
    status: numberOrUndefined(source.status),
    ok: typeof source.ok === "boolean" ? source.ok : undefined,
    payloadKeys: Array.isArray(source.payloadKeys) ? source.payloadKeys.map(stringify).filter(Boolean) : undefined,
    error: stringify(source.error),
  };
}

function stringify(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function numberOrUndefined(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
