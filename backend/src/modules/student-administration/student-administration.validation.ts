import { BadRequestException } from '@nestjs/common';
import { z, ZodError, type ZodType } from 'zod';
import type {
  ReplaceStudentAccountsRequestDto,
  StudentListQueryDto,
  StudentWriteRequestDto,
  SwitchStudentRequestDto,
} from './dto/student-administration.dto';

const nonEmptyString = z.string().trim().min(1);
const optionalString = z.string().trim().optional();
const optionalNullableString = z.string().trim().nullable().optional();
const booleanish = z.union([z.boolean(), z.enum(['true', 'false', '1', '0'])]);

const positiveInteger = z.preprocess(
  (value) => (typeof value === 'string' ? Number(value) : value),
  z.number().int().positive(),
);
const pageSizeInteger = z.preprocess(
  (value) => (typeof value === 'string' ? Number(value) : value),
  z.number().int().positive().max(100),
);

const stringIdArray = z.array(nonEmptyString);

const studentBaseFields = {
  code: nonEmptyString,
  full_name: nonEmptyString,
  avatar_url: optionalNullableString,
  grade: optionalNullableString,
  class_name: nonEmptyString,
  school_name: optionalString,
  guardian_account_ids: stringIdArray.optional(),
  is_active: z.boolean().optional(),
};

export const studentListQuerySchema = z.object({
  page: positiveInteger.optional(),
  page_size: pageSizeInteger.optional(),
  q: optionalString,
  grade: optionalString,
  class_name: optionalString,
  is_active: booleanish.optional(),
});

export const createStudentSchema = z.object(studentBaseFields);

export const updateStudentSchema = z
  .object({
    ...studentBaseFields,
    code: studentBaseFields.code.optional(),
    full_name: studentBaseFields.full_name.optional(),
    class_name: studentBaseFields.class_name.optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'payload must include at least one field',
    path: ['body'],
  });

export const replaceStudentAccountsSchema = z.object({
  account_ids: stringIdArray,
});

export const switchStudentSchema = z.object({
  student_id: nonEmptyString,
  account_id: nonEmptyString.optional(),
});

export function validateStudentListQuery(query: unknown): StudentListQueryDto {
  return parseRequest(studentListQuerySchema, query, 'query');
}

export function validateCreateStudent(
  payload: unknown,
): StudentWriteRequestDto {
  return parseRequest(createStudentSchema, payload, 'body');
}

export function validateUpdateStudent(
  payload: unknown,
): StudentWriteRequestDto {
  return parseRequest(updateStudentSchema, payload, 'body');
}

export function validateReplaceStudentAccounts(
  payload: unknown,
): ReplaceStudentAccountsRequestDto {
  return parseRequest(replaceStudentAccountsSchema, payload, 'body');
}

export function validateSwitchStudent(
  payload: unknown,
): SwitchStudentRequestDto {
  return parseRequest(switchStudentSchema, payload, 'body');
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
