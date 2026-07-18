import { BadRequestException } from '@nestjs/common';
import { z, ZodError, type ZodType } from 'zod';
import type {
  NewsListQueryDto,
  NewsPinRequestDto,
  NewsReorderRequestDto,
  NewsWriteRequestDto,
} from './dto/news.dto';

const nonEmpty = z.string().trim().min(1);
const audience = z.discriminatedUnion('type', [
  z.object({ type: z.literal('all'), value: z.null().optional() }),
  z.object({ type: z.literal('grade'), value: nonEmpty }),
  z.object({ type: z.literal('class'), value: nonEmpty }),
  z.object({ type: z.literal('student'), value: nonEmpty }),
]);
const fields = {
  title: nonEmpty,
  summary: nonEmpty,
  content: nonEmpty,
  image_url: z.string().url().nullable().optional(),
  category: nonEmpty,
  audiences: z.array(audience).min(1).max(100).optional(),
};
const positiveInteger = z.preprocess(
  (value) => (typeof value === 'string' ? Number(value) : value),
  z.number().int().positive(),
);

export const createNewsSchema = z.object(fields);
export const updateNewsSchema = z
  .object({
    ...fields,
    title: fields.title.optional(),
    summary: fields.summary.optional(),
    content: fields.content.optional(),
    category: fields.category.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'payload is empty');
export const newsListSchema = z.object({
  page: positiveInteger.optional(),
  page_size: positiveInteger.pipe(z.number().max(100)).optional(),
  q: z.string().trim().optional(),
  status: z.enum(['draft', 'published', 'hidden']).optional(),
});
export const pinSchema = z.object({ is_pinned: z.boolean() });
export const reorderSchema = z.object({ sort_order: z.number().int().min(0) });

export const validateCreateNews = (value: unknown): NewsWriteRequestDto =>
  parse(createNewsSchema, value);
export const validateUpdateNews = (value: unknown): NewsWriteRequestDto =>
  parse(updateNewsSchema, value);
export const validateNewsList = (value: unknown): NewsListQueryDto =>
  parse(newsListSchema, value);
export const validatePin = (value: unknown): NewsPinRequestDto =>
  parse(pinSchema, value);
export const validateReorder = (value: unknown): NewsReorderRequestDto =>
  parse(reorderSchema, value);

function parse<T>(schema: ZodType<T>, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException({
        message: 'Invalid request payload',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    throw error;
  }
}
