import { BadRequestException } from '@nestjs/common';
import { z, ZodError, type ZodType } from 'zod';
import {
  FEEDBACK_STATUSES,
  type FeedbackAdminListQuery,
  type FeedbackListQueryDto,
  type FeedbackStatusCommand,
  type FeedbackStatusUpdateDto,
} from './dto/feedback.dto';

const positiveInteger = z.preprocess(
  (value) => (typeof value === 'string' ? Number(value) : value),
  z.number().int().positive(),
);

const statusSchema = z.enum(FEEDBACK_STATUSES);

const listSchema = z
  .object({
    page: positiveInteger.default(1),
    page_size: positiveInteger.pipe(z.number().max(100)).default(20),
    q: z.string().trim().optional(),
    status: statusSchema.optional(),
  })
  .strict();

const updateStatusSchema = z
  .object({
    status: statusSchema,
  })
  .strict();

export function validateFeedbackList(
  value: FeedbackListQueryDto,
): FeedbackAdminListQuery {
  const parsed = parse(listSchema, value);
  return {
    page: parsed.page,
    page_size: parsed.page_size,
    ...(parsed.q ? { q: parsed.q } : {}),
    ...(parsed.status ? { status: parsed.status } : {}),
  };
}

export const validateFeedbackStatusUpdate = (
  value: FeedbackStatusUpdateDto,
): FeedbackStatusCommand => parse(updateStatusSchema, value);

function parse<T>(schema: ZodType<T>, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException({
        message: 'Invalid request payload',
        details: error.issues,
      });
    }
    throw error;
  }
}
