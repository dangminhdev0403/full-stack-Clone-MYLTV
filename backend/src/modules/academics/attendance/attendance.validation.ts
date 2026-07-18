import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import type {
  AttendanceListQueryDto,
  AttendanceSessionWriteDto,
} from './dto/attendance.dto';

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, 'Invalid calendar date');
const record = z.object({
  student_id: z.string().trim().min(1),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  note: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .transform((value) => value || null),
});
const records = z
  .array(record)
  .min(1)
  .superRefine((items, context) => {
    const ids = new Set<string>();
    items.forEach((item, index) => {
      if (ids.has(item.student_id))
        context.addIssue({
          code: 'custom',
          path: [index, 'student_id'],
          message: 'Student IDs must be unique',
        });
      ids.add(item.student_id);
    });
  });
const list = z.object({
  date: date.optional(),
  class_name: z.string().trim().min(1).optional(),
  period: z.enum(['morning', 'afternoon']).optional(),
  page: z.coerce.number().int().positive().optional(),
  page_size: z.coerce.number().int().min(1).max(100).optional(),
});
const create = z.object({
  date,
  class_name: z.string().trim().min(1),
  period: z.enum(['morning', 'afternoon']),
  records,
});
const update = z.object({ records });

export function validateAttendanceList(value: AttendanceListQueryDto) {
  return parse(list, value);
}
export function validateAttendanceCreate(value: AttendanceSessionWriteDto) {
  return parse(create, value);
}
export function validateAttendanceUpdate(value: AttendanceSessionWriteDto) {
  return parse(update, value);
}
function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new BadRequestException({
      message: 'Invalid attendance payload',
      issues: result.error.issues,
    });
  return result.data;
}
