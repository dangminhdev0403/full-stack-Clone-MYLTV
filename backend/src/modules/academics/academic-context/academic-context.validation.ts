import { BadRequestException } from '@nestjs/common';
import { z, ZodError, type ZodType } from 'zod';

const nonEmptyString = z.string().trim().min(1, 'Field cannot be empty');

const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid ISO date (YYYY-MM-DD)')
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, 'Must be a valid calendar date');

const positiveInt = z.coerce
  .number()
  .int('Must be an integer')
  .positive('Sort order must be a positive integer');

const createAcademicYearSchema = z
  .object({
    id: nonEmptyString,
    code: nonEmptyString,
    display_name: nonEmptyString,
    starts_on: dateSchema,
    ends_on: dateSchema,
  })
  .refine((data) => data.starts_on <= data.ends_on, {
    message: 'starts_on must be before or equal to ends_on',
    path: ['ends_on'],
  });

const updateAcademicYearSchema = z
  .object({
    code: nonEmptyString.optional(),
    display_name: nonEmptyString.optional(),
    starts_on: dateSchema.optional(),
    ends_on: dateSchema.optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'Payload must contain at least one field to update',
    path: ['body'],
  })
  .refine(
    (data) => {
      if (data.starts_on && data.ends_on) {
        return data.starts_on <= data.ends_on;
      }
      return true;
    },
    {
      message: 'starts_on must be before or equal to ends_on',
      path: ['ends_on'],
    },
  );

const createSemesterSchema = z
  .object({
    id: nonEmptyString,
    academic_year_id: nonEmptyString,
    code: nonEmptyString,
    display_name: nonEmptyString,
    starts_on: dateSchema,
    ends_on: dateSchema,
    sort_order: positiveInt,
  })
  .refine((data) => data.starts_on <= data.ends_on, {
    message: 'starts_on must be before or equal to ends_on',
    path: ['ends_on'],
  });

const updateSemesterSchema = z
  .object({
    code: nonEmptyString.optional(),
    display_name: nonEmptyString.optional(),
    starts_on: dateSchema.optional(),
    ends_on: dateSchema.optional(),
    sort_order: positiveInt.optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'Payload must contain at least one field to update',
    path: ['body'],
  })
  .refine(
    (data) => {
      if (data.starts_on && data.ends_on) {
        return data.starts_on <= data.ends_on;
      }
      return true;
    },
    {
      message: 'starts_on must be before or equal to ends_on',
      path: ['ends_on'],
    },
  );

export type CreateAcademicYearDto = z.infer<typeof createAcademicYearSchema>;
export type UpdateAcademicYearDto = z.infer<typeof updateAcademicYearSchema>;
export type CreateSemesterDto = z.infer<typeof createSemesterSchema>;
export type UpdateSemesterDto = z.infer<typeof updateSemesterSchema>;

export function validateCreateAcademicYear(
  payload: unknown,
): CreateAcademicYearDto {
  return parseRequest(createAcademicYearSchema, payload, 'body');
}

export function validateUpdateAcademicYear(
  payload: unknown,
): UpdateAcademicYearDto {
  return parseRequest(updateAcademicYearSchema, payload, 'body');
}

export function validateCreateSemester(payload: unknown): CreateSemesterDto {
  return parseRequest(createSemesterSchema, payload, 'body');
}

export function validateUpdateSemester(payload: unknown): UpdateSemesterDto {
  return parseRequest(updateSemesterSchema, payload, 'body');
}

function parseRequest<T>(
  schema: ZodType<T>,
  value: unknown,
  source: string,
): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException({
        message: 'Invalid request payload',
        details: error.issues.map((issue) => ({
          source,
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    throw error;
  }
}
