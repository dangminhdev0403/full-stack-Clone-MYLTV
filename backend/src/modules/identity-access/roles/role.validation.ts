import { BadRequestException } from '@nestjs/common';
import { z, ZodError, type ZodType } from 'zod';

const nonEmptyString = z.string().trim().min(1, 'Field cannot be empty');

const booleanCoerce = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    if (val.toLowerCase() === 'true') return true;
    if (val.toLowerCase() === 'false') return false;
    return undefined;
  })
  .pipe(z.boolean().optional());

const listRolesQuerySchema = z.object({
  search: z.string().trim().optional(),
  is_active: booleanCoerce,
});

const uniquePermissionKeys = z
  .array(z.string().trim())
  .refine((keys) => new Set(keys).size === keys.length, {
    message: 'Permission keys must be unique',
  });

const positiveIntVersion = z
  .number()
  .int('Version must be an integer')
  .positive('Version must be a positive integer')
  .optional();

const createRoleSchema = z.object({
  code: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, 'Code must be at least 2 characters')
    .max(50, 'Code must not exceed 50 characters')
    .regex(
      /^[a-z0-9_]+$/,
      'Code must contain only lowercase letters, numbers, and underscores',
    ),
  name: nonEmptyString,
  description: z.string().trim().optional(),
  permission_keys: uniquePermissionKeys.optional(),
  confirm_critical: z.boolean().optional(),
});

const updateRoleSchema = z
  .object({
    name: nonEmptyString.optional(),
    description: z.string().trim().optional(),
    version: positiveIntVersion,
  })
  .refine(
    (payload) =>
      payload.name !== undefined || payload.description !== undefined,
    {
      message: 'Payload must contain at least one field to update',
      path: ['body'],
    },
  );

const updateRoleStatusSchema = z.object({
  is_active: z.boolean(),
  version: positiveIntVersion,
});

const replaceRolePermissionsSchema = z.object({
  permission_keys: uniquePermissionKeys,
  confirm_critical: z.boolean().optional(),
  version: positiveIntVersion,
});

const assignAccountRolesSchema = z.object({
  role_ids: z
    .array(nonEmptyString)
    .min(1, 'At least one role ID must be assigned')
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'Role IDs must be unique',
    }),
  confirm_critical: z.boolean().optional(),
});

export type ListRolesQueryDto = z.infer<typeof listRolesQuerySchema>;
export type CreateRoleDto = z.infer<typeof createRoleSchema>;
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
export type UpdateRoleStatusDto = z.infer<typeof updateRoleStatusSchema>;
export type ReplaceRolePermissionsDto = z.infer<
  typeof replaceRolePermissionsSchema
>;
export type AssignAccountRolesDto = z.infer<typeof assignAccountRolesSchema>;

export function validateListRolesQuery(payload: unknown): ListRolesQueryDto {
  return parseRequest(listRolesQuerySchema, payload, 'query');
}

export function validateCreateRole(payload: unknown): CreateRoleDto {
  return parseRequest(createRoleSchema, payload, 'body');
}

export function validateUpdateRole(payload: unknown): UpdateRoleDto {
  return parseRequest(updateRoleSchema, payload, 'body');
}

export function validateUpdateRoleStatus(
  payload: unknown,
): UpdateRoleStatusDto {
  return parseRequest(updateRoleStatusSchema, payload, 'body');
}

export function validateReplaceRolePermissions(
  payload: unknown,
): ReplaceRolePermissionsDto {
  return parseRequest(replaceRolePermissionsSchema, payload, 'body');
}

export function validateAssignAccountRoles(
  payload: unknown,
): AssignAccountRolesDto {
  return parseRequest(assignAccountRolesSchema, payload, 'body');
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
