import { z } from 'zod';

// Common Primitives
export const DateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format');

export const IsoDateTimeStringSchema = z
  .string()
  .datetime({ offset: true }, 'Must be valid ISO-8601 string');

// 1. News Schemas
export const NewsItemSchema = z.object({
  id: z.string().min(1),
  source: z.string().default('SLLĐT'),
  author_name: z.string().default('Lương Thế Vinh'),
  title: z.string().trim().min(1, 'Title is required').max(200),
  summary: z.string().trim().max(500).nullable().optional(),
  content: z.string().trim().min(1, 'Content is required'),
  image_url: z.string().url().nullable().optional(),
  category: z.enum(['Thong bao', 'Tin tuc', 'Su kien', 'General']).default('Tin tuc'),
  published_at: z.string(),
  is_pinned: z.boolean().default(false),
});

export const NewsCreateSchema = NewsItemSchema.pick({
  title: true,
  summary: true,
  content: true,
  image_url: true,
  category: true,
  is_pinned: true,
}).extend({
  source: z.string().optional(),
  author_name: z.string().optional(),
});

// 2. Attendance Schemas
export const AttendanceSessionDetailSchema = z.object({
  session_code: z.enum(['morning', 'afternoon']),
  status: z.enum(['present', 'absent', 'late', 'excused', 'leave_early']),
  check_in_at: z.string().nullable().optional(),
  check_out_at: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

export const AttendanceTodaySchema = z.object({
  date: DateStringSchema,
  student_id: z.string().min(1),
  sessions: z.array(AttendanceSessionDetailSchema).min(1),
});

export const AttendanceHistoryItemSchema = z.object({
  date: DateStringSchema,
  period: z.enum(['morning', 'afternoon']),
  status: z.enum(['present', 'absent', 'late', 'excused', 'leave_early']),
  check_in_at: z.string().nullable().optional(),
  check_out_at: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

export const StudentAttendanceResponseSchema = z.object({
  student_id: z.string().min(1),
  history: z.array(AttendanceHistoryItemSchema),
});

// 3. Tuition Schemas
export const TuitionChargeSchema = z.object({
  id: z.string().min(1),
  student_id: z.string().min(1, 'Student ID is required'),
  semester_id: z.string().min(1, 'Semester ID is required'),
  title: z.string().trim().min(1, 'Title is required').max(150),
  amount_due: z.number().int().positive('Amount due must be positive'),
  amount_paid: z.number().int().nonnegative('Amount paid must be non-negative').default(0),
  amount_outstanding: z.number().int().nonnegative(),
  status: z.enum(['unpaid', 'partial', 'paid', 'waived']),
  due_date: DateStringSchema.nullable().optional(),
  note: z.string().nullable().optional(),
  is_waived: z.boolean().default(false),
});

export const TuitionCreateSchema = TuitionChargeSchema.pick({
  student_id: true,
  semester_id: true,
  title: true,
  amount_due: true,
  amount_paid: true,
  due_date: true,
  note: true,
  is_waived: true,
});

// 4. Student Services Schemas
export const MealRegistrationSchema = z.object({
  student_id: z.string().min(1, 'Student ID is required'),
  dates: z.array(DateStringSchema).min(1, 'At least one date is required'),
  action: z.enum(['register', 'cancel']),
});

export const UniformOrderSchema = z.object({
  student_id: z.string().min(1, 'Student ID is required'),
  items: z
    .array(
      z.object({
        product_id: z.string().min(1),
        product_name: z.string().min(1),
        size: z.enum(['S', 'M', 'L', 'XL']),
        quantity: z.number().int().positive(),
        price: z.number().int().positive(),
      }),
    )
    .min(1, 'Order must contain at least one item'),
  note: z.string().optional(),
});

export const FeedbackSubmitSchema = z.object({
  student_id: z.string().optional(),
  title: z.string().trim().min(1, 'Title is required').max(200),
  content: z.string().trim().min(1, 'Content is required'),
  category: z.string().default('khac'),
  attachments: z.array(z.string().url()).optional(),
});

// Export inferred TypeScript types from Zod schemas
export type NewsItemZod = z.infer<typeof NewsItemSchema>;
export type NewsCreateZod = z.infer<typeof NewsCreateSchema>;
export type AttendanceTodayZod = z.infer<typeof AttendanceTodaySchema>;
export type StudentAttendanceResponseZod = z.infer<typeof StudentAttendanceResponseSchema>;
export type TuitionChargeZod = z.infer<typeof TuitionChargeSchema>;
export type TuitionCreateZod = z.infer<typeof TuitionCreateSchema>;
export type MealRegistrationZod = z.infer<typeof MealRegistrationSchema>;
export type UniformOrderZod = z.infer<typeof UniformOrderSchema>;
export type FeedbackSubmitZod = z.infer<typeof FeedbackSubmitSchema>;
