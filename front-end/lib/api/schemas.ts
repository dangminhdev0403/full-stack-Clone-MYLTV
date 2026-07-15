import { z } from "zod";

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({ code: z.string(), message: z.string(), details: z.unknown().optional() }),
  request_id: z.string().optional(),
});

export const accountSchema = z.object({
  id: z.string(), username: z.string(), display_name: z.string(),
  role: z.enum(["parent", "student", "teacher", "admin", "super_admin"]),
  permissions: z.array(z.string()),
});

export const sessionActorSchema = z.object({ account: accountSchema, active_student_id: z.string().nullable() });
export const authTokensSchema = z.object({ access_token: z.string(), refresh_token: z.string(), expires_in: z.number() });

export const userSchema = z.object({
  id: z.string(), username: z.string(), display_name: z.string(),
  role: accountSchema.shape.role, is_active: z.boolean(), created_at: z.string(), updated_at: z.string(),
  permission_keys: z.array(z.string()).optional(),
});
export const studentSchema = z.object({
  id: z.string(), code: z.string(), full_name: z.string(), avatar_url: z.string().nullable(),
  grade: z.string().nullable(), class_name: z.string(), school_name: z.string(), is_active: z.boolean(),
  created_at: z.string(), updated_at: z.string(),
});

export function successSchema<T extends z.ZodType>(data: T) {
  return z.object({ success: z.literal(true), data, meta: z.unknown().optional() });
}

export class ApiClientError extends Error {
  constructor(public readonly code: string, message: string, public readonly details?: unknown, public readonly requestId?: string, public readonly status = 500) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function parseApiResponse<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
  const body: unknown = await response.json().catch(() => null);
  const error = apiErrorSchema.safeParse(body);
  if (error.success) throw new ApiClientError(error.data.error.code, error.data.error.message, error.data.error.details, error.data.request_id, response.status);
  if (!response.ok) throw new ApiClientError("UPSTREAM_ERROR", "Backend request failed", undefined, undefined, response.status);
  return schema.parse(body);
}
