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
export const studentSummarySchema = z.object({
  id: z.string(), code: z.string(), full_name: z.string(), avatar_url: z.string().nullable(),
  grade: z.string().nullable(), class_name: z.string(), school_name: z.string(), is_active: z.boolean(),
  created_at: z.string(), updated_at: z.string(),
});

export const studentGuardianRelationshipSchema = z.enum(["father", "mother", "grandfather", "grandmother", "guardian", "other"]);
export const studentGenderSchema = z.enum(["male", "female", "other"]);

export const studentGuardianContactSchema = z.object({
  id: z.string().optional(),
  relationship: studentGuardianRelationshipSchema,
  relationship_label: z.string().nullable(),
  full_name: z.string(),
  phone: z.string(),
  is_emergency_contact: z.boolean(),
});

export const studentDetailSchema = studentSummarySchema.extend({
  date_of_birth: z.string().nullable().default(null),
  gender: studentGenderSchema.nullable().default(null),
  ethnicity: z.string().nullable().default(null),
  birth_place: z.string().nullable().default(null),
  permanent_address: z.string().nullable().default(null),
  cohort_start_year: z.number().int().nullable().default(null),
  cohort_end_year: z.number().int().nullable().default(null),
  guardian_contacts: z.array(studentGuardianContactSchema).default([]),
});

export const studentSchema = studentSummarySchema;

export const attendanceStatusSchema = z.enum(["present", "absent", "late", "excused"]);
export const attendancePeriodSchema = z.enum(["morning", "afternoon"]);
export const attendanceRecordSchema = z.object({
  id: z.string(), student_id: z.string(), student_code: z.string(), student_name: z.string(),
  avatar_url: z.string().nullable(), grade: z.string().nullable(), class_name: z.string(),
  status: attendanceStatusSchema, note: z.string().nullable(),
});
export const attendanceSessionSchema = z.object({
  id: z.string(), date: z.string(), period: attendancePeriodSchema, class_name: z.string(), semester_id: z.string(),
  counts: z.object({ present: z.number(), absent: z.number(), late: z.number(), excused: z.number() }),
  records: z.array(attendanceRecordSchema),
});

export const tuitionStatusSchema = z.enum(["unpaid", "partial", "paid", "waived"]);
export const tuitionChargeSchema = z.object({
  id: z.string(), student_id: z.string(), student_code: z.string(), student_name: z.string(),
  grade: z.string().nullable(), class_name: z.string(), semester_id: z.string(), semester_name: z.string(),
  academic_year_id: z.string(), academic_year_name: z.string(), title: z.string(),
  amount_due: z.number().int(), amount_paid: z.number().int(), amount_outstanding: z.number().int(),
  status: tuitionStatusSchema, due_date: z.string().nullable(), note: z.string().nullable(),
  is_waived: z.boolean(), created_at: z.string(), updated_at: z.string(),
});
export const tuitionListSchema = z.object({
  items: z.array(tuitionChargeSchema), page: z.number(), page_size: z.number(), total: z.number(), has_next: z.boolean(),
  summary: z.object({ amount_due: z.number().int(), amount_paid: z.number().int(), amount_outstanding: z.number().int() }),
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
