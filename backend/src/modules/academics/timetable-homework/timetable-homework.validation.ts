import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

const text = z.string().trim().min(1);
const deadline = z.string().datetime();

export class ListHomeworksQueryDto {
  page?: number;
  page_size?: number;
  q?: string;
  class_id?: string;
  student_id?: string;
  status?: string;
  include_archived?: boolean;
}

export class CreateHomeworkDto {
  target_type!: 'class' | 'students';
  class_id?: string;
  student_ids?: string[];
  subject_id?: string;
  subject!: string;
  title!: string;
  content!: string;
  teacher!: string;
  deadline!: string;
}

export class UpdateHomeworkDto {
  subject_id?: string | null;
  subject?: string;
  title?: string;
  content?: string;
  teacher?: string;
  deadline?: string;
}

const listSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
  class_id: z.string().trim().optional(),
  student_id: z.string().trim().optional(),
  status: z.enum(['pending', 'active', 'archived']).optional(),
  include_archived: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .or(z.boolean())
    .optional(),
});

const createSchema = z
  .object({
    target_type: z.enum(['class', 'students']),
    class_id: text.optional(),
    student_ids: z.array(text).min(1).max(200).optional(),
    subject_id: text.optional(),
    subject: text.max(255),
    title: text.max(255),
    content: text.max(5000),
    teacher: text.max(255),
    deadline,
  })
  .superRefine((value, context) => {
    if (value.target_type === 'class' && (!value.class_id || value.student_ids))
      context.addIssue({
        code: 'custom',
        message: 'class target requires class_id only',
      });
    if (
      value.target_type === 'students' &&
      (!value.student_ids || value.class_id)
    )
      context.addIssue({
        code: 'custom',
        message: 'students target requires student_ids only',
      });
  });

const updateSchema = z
  .object({
    subject_id: text.nullable().optional(),
    subject: text.max(255).optional(),
    title: text.max(255).optional(),
    content: text.max(5000).optional(),
    teacher: text.max(255).optional(),
    deadline: deadline.optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one field is required',
  );

export class ListAdminTimetableQueryDto {
  class_id!: string;
  semester_id!: string;
  week_start!: string;
}

export class TimetableLessonDto {
  day_of_week!: number;
  period!: number;
  subject!: string;
  teacher?: string;
  room?: string;
}

export class SaveAdminTimetableDto {
  class_id!: string;
  semester_id!: string;
  week_start!: string;
  schedules!: TimetableLessonDto[];
}

const listTimetableSchema = z.object({
  class_id: text,
  semester_id: text,
  week_start: z.string().date(),
});

const saveTimetableSchema = z.object({
  class_id: text,
  semester_id: text,
  week_start: z.string().date(),
  schedules: z
    .array(
      z.object({
        day_of_week: z.number().int().min(1).max(7),
        period: z.number().int().min(1).max(20),
        subject: text.max(255),
        teacher: text.max(255).optional(),
        room: text.max(100).optional(),
      }),
    )
    .max(140)
    .superRefine((items, context) => {
      const slots = new Set<string>();
      items.forEach((item, index) => {
        const slot = `${item.day_of_week}:${item.period}`;
        if (slots.has(slot))
          context.addIssue({
            code: 'custom',
            path: [index],
            message: 'Duplicate timetable slot',
          });
        slots.add(slot);
      });
    }),
});

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new BadRequestException({
      message: 'Validation failed',
      issues: result.error.issues,
    });
  return result.data;
}

export const validateListHomeworks = (value: unknown) =>
  parse(listSchema, value);
export const validateCreateHomework = (value: unknown) =>
  parse(createSchema, value);
export const validateUpdateHomework = (value: unknown) =>
  parse(updateSchema, value);
export const validateListAdminTimetable = (value: unknown) =>
  parse(listTimetableSchema, value);
export const validateSaveAdminTimetable = (value: unknown) =>
  parse(saveTimetableSchema, value);
