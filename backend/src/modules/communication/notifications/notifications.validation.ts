import { BadRequestException } from '@nestjs/common';
import { z, ZodError, type ZodType } from 'zod';
import type {
  NotificationListQueryDto,
  NotificationWriteRequestDto,
} from './dto/notifications.dto';

const nonEmpty = z.string().trim().min(1);
const positiveInteger = z.preprocess(
  (value) => (typeof value === 'string' ? Number(value) : value),
  z.number().int().positive(),
);
const fields = {
  title: nonEmpty,
  sender: nonEmpty,
  content: nonEmpty,
  tag: nonEmpty.optional(),
};

const listSchema = z.object({
  page: positiveInteger.optional(),
  page_size: positiveInteger.pipe(z.number().max(100)).optional(),
  limit: positiveInteger.pipe(z.number().max(100)).optional(),
  q: z.string().trim().optional(),
  keyword: z.string().trim().optional(),
  tag: z.string().trim().min(1).optional(),
});
const createSchema = z.object(fields);
const updateSchema = z
  .object({
    title: nonEmpty.optional(),
    sender: nonEmpty.optional(),
    content: nonEmpty.optional(),
    tag: nonEmpty.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'payload is empty');

export const validateNotificationList = (
  value: unknown,
): NotificationListQueryDto => parse(listSchema, value);
export const validateCreateNotification = (
  value: unknown,
): NotificationWriteRequestDto => parse(createSchema, value);
export const validateUpdateNotification = (
  value: unknown,
): NotificationWriteRequestDto => parse(updateSchema, value);

function parse<T>(schema: ZodType<T>, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError)
      throw new BadRequestException({
        message: 'Invalid request payload',
        details: error.issues,
      });
    throw error;
  }
}
