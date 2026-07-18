import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import type {
  TuitionCreateDto,
  TuitionListQueryDto,
  TuitionUpdateDto,
} from './dto/tuition.dto';

const id = z.string().trim().min(1).max(100);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, 'Invalid date');
const money = z.number().int().min(0).max(2_000_000_000);
const nullableText = z.string().trim().max(500).nullable();
const fields = {
  title: z.string().trim().min(1).max(160),
  amount_due: money,
  amount_paid: money.default(0),
  due_date: date.nullable().default(null),
  note: nullableText.default(null),
  is_waived: z.boolean().default(false),
};
const createSchema = z
  .object({ student_id: id, semester_id: id, ...fields })
  .strict()
  .refine((value) => value.is_waived || value.amount_paid <= value.amount_due, {
    message: 'amount_paid cannot exceed amount_due',
  });
const updateSchema = z
  .object({
    title: fields.title.optional(),
    amount_due: money.optional(),
    amount_paid: money.optional(),
    due_date: date.nullable().optional(),
    note: nullableText.optional(),
    is_waived: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Update cannot be empty')
  .refine(
    (value) =>
      value.is_waived === true ||
      value.amount_due === undefined ||
      value.amount_paid === undefined ||
      value.amount_paid <= value.amount_due,
    'amount_paid cannot exceed amount_due',
  );
const listSchema = z
  .object({
    student_id: id.optional(),
    class_name: z.string().trim().min(1).max(50).optional(),
    semester_id: id.optional(),
    academic_year_id: id.optional(),
    status: z.enum(['unpaid', 'partial', 'paid', 'waived']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export function validateTuitionCreate(value: unknown): TuitionCreateDto {
  return parse(createSchema, value);
}
export function validateTuitionUpdate(value: unknown): TuitionUpdateDto {
  return parse(updateSchema, value);
}
export function validateTuitionList(value: unknown): TuitionListQueryDto {
  return parse(listSchema, value);
}
function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new BadRequestException({
      message: 'Invalid tuition request',
      details: result.error.flatten(),
    });
  return result.data;
}
