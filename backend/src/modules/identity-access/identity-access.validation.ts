import { BadRequestException } from '@nestjs/common';
import { z, ZodError, type ZodType } from 'zod';
import type { ChangePasswordRequestDto } from './dto/account.dto';
import type {
  LoginRequestDto,
  LogoutRequestDto,
  RefreshTokenRequestDto,
} from './dto/auth.dto';

const optionalNullableString = z.string().trim().min(1).nullable().optional();

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
  device_id: optionalNullableString,
  fcm_token: optionalNullableString,
});

const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1),
});

const logoutSchema = z.object({
  device_id: optionalNullableString,
});

const changePasswordSchema = z
  .object({
    old_password: z.string().min(1),
    new_password: z.string().min(8),
    confirm_password: z.string().min(8),
  })
  .refine((payload) => payload.new_password === payload.confirm_password, {
    message: 'Password confirmation does not match',
    path: ['confirm_password'],
  });

export function validateLogin(payload: unknown): LoginRequestDto {
  return parseRequest(loginSchema, payload);
}

export function validateRefreshToken(payload: unknown): RefreshTokenRequestDto {
  return parseRequest(refreshTokenSchema, payload);
}

export function validateLogout(payload: unknown): LogoutRequestDto {
  return parseRequest(logoutSchema, payload);
}

export function validateChangePassword(
  payload: unknown,
): ChangePasswordRequestDto {
  return parseRequest(changePasswordSchema, payload);
}

function parseRequest<T>(schema: ZodType<T>, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException({
        message: 'Invalid request payload',
        details: error.issues.map((issue) => ({
          source: 'body',
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    throw error;
  }
}
