import { BadRequestException } from '@nestjs/common';
import { z, ZodError, type ZodType } from 'zod';
import type {
  CreateUserRequestDto,
  ResetPasswordRequestDto,
  UpdateUserRequestDto,
  UserListQueryDto,
} from './dto/user-management.dto';

const roleSchema = z.enum([
  'parent',
  'student',
  'teacher',
  'admin',
  'super_admin',
]);
const nonEmptyString = z.string().trim().min(1);
const passwordSchema = z.string().min(8);
const positiveInteger = z.preprocess(
  (value) => (typeof value === 'string' ? Number(value) : value),
  z.number().int().positive(),
);
const booleanish = z.union([z.boolean(), z.enum(['true', 'false', '1', '0'])]);

const userListQuerySchema = z.object({
  q: z.string().trim().optional(),
  role: roleSchema.optional(),
  is_active: booleanish.optional(),
  page: positiveInteger.optional(),
  page_size: positiveInteger.pipe(z.number().max(100)).optional(),
});

const createUserSchema = z.object({
  username: nonEmptyString,
  display_name: nonEmptyString,
  role: roleSchema,
  password: passwordSchema,
  permission_keys: z.array(nonEmptyString),
});

const updateUserSchema = z
  .object({
    display_name: nonEmptyString.optional(),
    role: roleSchema.optional(),
    is_active: z.boolean().optional(),
    permission_keys: z.array(nonEmptyString).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'payload must include at least one field',
    path: ['body'],
  });

const resetPasswordSchema = z.object({ password: passwordSchema });

export function validateUserListQuery(query: unknown): UserListQueryDto {
  return parseRequest(userListQuerySchema, query, 'query');
}

export function validateCreateUser(payload: unknown): CreateUserRequestDto {
  return parseRequest(createUserSchema, payload, 'body');
}

export function validateUpdateUser(payload: unknown): UpdateUserRequestDto {
  return parseRequest(updateUserSchema, payload, 'body');
}

export function validateResetPassword(
  payload: unknown,
): ResetPasswordRequestDto {
  return parseRequest(resetPasswordSchema, payload, 'body');
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
