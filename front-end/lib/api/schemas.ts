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

export const notificationItemSchema = z.object({
  id: z.string(), title: z.string(), sender: z.string(), sent_at: z.string(), content: z.string(),
  tag: z.string(), is_read: z.boolean(),
});
export const notificationListSchema = z.object({
  items: z.array(notificationItemSchema),
  pagination: z.object({ page: z.number(), limit: z.number(), total: z.number() }),
});

export const subjectScoreSchema = z.object({
  subject_id: z.string(), subject_name: z.string(),
  oral_scores: z.array(z.number()), fifteen_minute_scores: z.array(z.number()),
  midterm_score: z.number().nullable(), final_score: z.number().nullable(),
  average_score: z.number().nullable(), teacher_comment: z.string().nullable(),
});
export const studentScoresSchema = z.object({
  student_id: z.string(), school_year: z.string(), semester: z.string(),
  subjects: z.array(subjectScoreSchema),
});

export const rewardDisciplineItemSchema = z.object({
  id: z.string(), type: z.enum(["reward", "discipline"]), title: z.string(), content: z.string(),
  date: z.string(), issuer: z.string().nullable(),
});

export const timetableLessonSchema = z.object({
  period: z.string(), subject: z.string(), time: z.string(), room: z.string().optional(),
  teacher: z.string().optional(), status: z.string().optional(),
});
export const timetableDaySchema = z.object({
  day_code: z.string(), date: z.string(), lessons: z.array(timetableLessonSchema),
});
export const timetableResponseSchema = z.object({
  week_start: z.string(), days: z.array(timetableDaySchema),
});

export const homeworkItemSchema = z.object({
  id: z.string(), subject: z.string(), title: z.string(), content: z.string(),
  teacher: z.string(), assigned_at: z.string(), deadline: z.string(),
  status: z.enum(["pending", "doing", "submitted", "overdue"]),
  submission_url: z.string().nullable().optional(), submitted_at: z.string().nullable().optional(),
});
export const homeworkListSchema = z.object({
  progress: z.object({ completed: z.number(), total: z.number() }),
  items: z.array(homeworkItemSchema),
  pagination: z.object({ page: z.number(), limit: z.number(), total: z.number() }),
});

export const onlineStudyItemSchema = z.object({
  id: z.string(), title: z.string(), subject: z.string(), teacher: z.string(),
  start_at: z.string(), end_at: z.string(), meeting_url: z.string(),
  status: z.enum(["upcoming", "live", "ended"]),
});

export const mealItemSchema = z.object({
  date: z.string(), breakfast: z.string().nullable(), lunch: z.string().nullable(),
  snack: z.string().nullable(), status: z.enum(["registered", "cancelled", "served"]),
});
export const mealsResponseSchema = z.object({
  registered: z.boolean(), items: z.array(mealItemSchema),
});

export const coinTransactionSchema = z.object({
  id: z.string(), type: z.enum(["deposit", "withdraw", "payment", "refund"]),
  amount: z.number(), description: z.string(), created_at: z.string(),
});
export const coinFundResponseSchema = z.object({
  balance: z.number(), currency: z.string(), transactions: z.array(coinTransactionSchema),
});

export const eventItemSchema = z.object({
  id: z.string(), title: z.string(), description: z.string(), start_at: z.string(),
  end_at: z.string(), location: z.string().nullable(), registration_deadline: z.string().nullable(),
  status: z.enum(["open", "closed", "joined"]),
});

export const surveyQuestionSchema = z.object({
  id: z.string(), type: z.enum(["text", "single_choice", "multiple_choice", "rating"]),
  content: z.string(), options: z.array(z.string()).optional(), required: z.boolean(),
});
export const surveyItemSchema = z.object({
  id: z.string(), title: z.string(), description: z.string(), deadline: z.string(),
  status: z.enum(["pending", "submitted", "expired"]), questions: z.array(surveyQuestionSchema),
});

export const clubItemSchema = z.object({
  id: z.string(), name: z.string(), description: z.string(), teacher: z.string().nullable(),
  schedule: z.string().nullable(), location: z.string().nullable(), fee: z.number(),
  status: z.enum(["open", "joined", "closed"]),
});

export const busRouteResponseSchema = z.object({
  route_id: z.string().nullable(), route_name: z.string().nullable(), pickup_point: z.string().nullable(),
  dropoff_point: z.string().nullable(), pickup_time: z.string().nullable(), dropoff_time: z.string().nullable(),
  driver_name: z.string().nullable(), driver_phone: z.string().nullable(), bus_plate: z.string().nullable(),
});

export const busTrackingResponseSchema = z.object({
  route_id: z.string(), route_name: z.string(), bus_plate: z.string(), driver_name: z.string(),
  driver_phone: z.string(), current_location: z.object({ lat: z.number(), lng: z.number(), updated_at: z.string() }),
  next_stop: z.string().nullable(), estimated_arrival_time: z.string().nullable(),
});

export const uniformItemSchema = z.object({
  id: z.string(), name: z.string(), category: z.string(), price: z.number(), currency: z.string(),
  sizes: z.array(z.string()), image_url: z.string().nullable(), stock: z.number(),
});

export const uploadResponseSchema = z.object({
  file_id: z.string(), file_name: z.string(), file_url: z.string(), mime_type: z.string(), size: z.number(),
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
