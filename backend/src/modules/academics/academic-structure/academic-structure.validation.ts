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

const nonNegativeInt = z.coerce
  .number()
  .int('Must be an integer')
  .min(0, 'Sort order must be zero or a positive integer');

const booleanCoerce = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    if (typeof val === 'boolean') return val;
    const str = String(val).toLowerCase();
    if (str === 'true') return true;
    if (str === 'false') return false;
    return undefined;
  });

const createGradeLevelSchema = z.object({
  id: nonEmptyString.optional(),
  code: nonEmptyString,
  display_name: nonEmptyString,
  sort_order: nonNegativeInt.optional(),
});

const updateGradeLevelSchema = z
  .object({
    code: nonEmptyString.optional(),
    display_name: nonEmptyString.optional(),
    sort_order: nonNegativeInt.optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'Payload must contain at least one field to update',
    path: ['body'],
  });

const optionalQueryString = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val && val.length > 0 ? val : undefined));

const listClassesQuerySchema = z.object({
  academic_year_id: optionalQueryString,
  grade_level_id: optionalQueryString,
  is_active: booleanCoerce.optional(),
});

const createSchoolClassSchema = z.object({
  id: nonEmptyString.optional(),
  academic_year_id: nonEmptyString,
  grade_level_id: nonEmptyString,
  code: nonEmptyString,
  display_name: nonEmptyString,
  homeroom_teacher_id: z.string().trim().nullable().optional(),
  is_active: z.boolean().optional(),
});

const updateSchoolClassSchema = z
  .object({
    academic_year_id: nonEmptyString.optional(),
    grade_level_id: nonEmptyString.optional(),
    code: nonEmptyString.optional(),
    display_name: nonEmptyString.optional(),
    homeroom_teacher_id: z.string().trim().nullable().optional(),
    is_active: z.boolean().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'Payload must contain at least one field to update',
    path: ['body'],
  });

const assignStudentEnrollmentSchema = z.object({
  student_id: nonEmptyString,
  starts_on: dateSchema.optional(),
});

const transferStudentsSchema = z.object({
  student_ids: z
    .array(nonEmptyString)
    .min(1, 'At least one student must be selected'),
  target_class_id: nonEmptyString,
  reason: z.string().trim().optional(),
});

const promoteCohortSchema = z.object({
  source_class_id: nonEmptyString,
  target_class_id: nonEmptyString,
  student_ids: z.array(nonEmptyString).optional(),
});

export type CreateGradeLevelDto = z.infer<typeof createGradeLevelSchema>;
export type UpdateGradeLevelDto = z.infer<typeof updateGradeLevelSchema>;
export type ListClassesQueryDto = z.infer<typeof listClassesQuerySchema>;
export type CreateSchoolClassDto = z.infer<typeof createSchoolClassSchema>;
export type UpdateSchoolClassDto = z.infer<typeof updateSchoolClassSchema>;
export type AssignStudentEnrollmentDto = z.infer<
  typeof assignStudentEnrollmentSchema
>;
export type TransferStudentsDto = z.infer<typeof transferStudentsSchema>;
export type PromoteCohortDto = z.infer<typeof promoteCohortSchema>;

export function validateCreateGradeLevel(
  payload: unknown,
): CreateGradeLevelDto {
  return parseRequest(createGradeLevelSchema, payload, 'body');
}

export function validateUpdateGradeLevel(
  payload: unknown,
): UpdateGradeLevelDto {
  return parseRequest(updateGradeLevelSchema, payload, 'body');
}

export function validateListClassesQuery(
  payload: unknown,
): ListClassesQueryDto {
  return parseRequest(listClassesQuerySchema, payload, 'query');
}

export function validateCreateSchoolClass(
  payload: unknown,
): CreateSchoolClassDto {
  return parseRequest(createSchoolClassSchema, payload, 'body');
}

export function validateUpdateSchoolClass(
  payload: unknown,
): UpdateSchoolClassDto {
  return parseRequest(updateSchoolClassSchema, payload, 'body');
}

export function validateAssignStudentEnrollment(
  payload: unknown,
): AssignStudentEnrollmentDto {
  return parseRequest(assignStudentEnrollmentSchema, payload, 'body');
}

export function validateTransferStudents(
  payload: unknown,
): TransferStudentsDto {
  return parseRequest(transferStudentsSchema, payload, 'body');
}

export function validatePromoteCohort(payload: unknown): PromoteCohortDto {
  return parseRequest(promoteCohortSchema, payload, 'body');
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
