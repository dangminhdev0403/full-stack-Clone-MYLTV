import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

export class SaveScoreDto {
  student_id!: string;
  semester_id?: string;
  school_year?: string;
  semester_code?: string;
  subject_id!: string;
  subject_name!: string;
  oral_scores?: number[];
  fifteen_min_scores?: number[];
  midterm_score?: number | null;
  final_score?: number | null;
  average_score?: number | null;
  teacher_comment?: string | null;
}

export class SaveRewardDisciplineDto {
  student_id!: string;
  semester_id?: string;
  school_year?: string;
  type!: 'reward' | 'discipline';
  title!: string;
  content!: string;
  date!: string;
  issuer?: string | null;
}

export class ListScoresQueryDto {
  student_id?: string;
  student?: string;
  class_name?: string;
  class?: string;
  school_year?: string;
  academic_year?: string;
  semester?: string;
  semester_id?: string;
  semester_code?: string;
  subject_id?: string;
  subject?: string;
  page?: number;
  page_size?: number;
  q?: string;
}

const scoreValue = z
  .number()
  .min(0, 'Score must be at least 0')
  .max(10, 'Score cannot exceed 10');

const dateRegex = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((val) => {
    const d = new Date(`${val}T00:00:00.000Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === val;
  }, 'Invalid calendar date');

export const saveScoreSchema = z.object({
  student_id: z.string().trim().min(1, 'student_id is required'),
  semester_id: z.string().trim().min(1).optional(),
  school_year: z.string().trim().min(1).optional(),
  semester_code: z.string().trim().min(1).optional(),
  subject_id: z.string().trim().min(1, 'subject_id is required'),
  subject_name: z.string().trim().min(1, 'subject_name is required'),
  oral_scores: z.array(scoreValue).optional(),
  fifteen_min_scores: z.array(scoreValue).optional(),
  midterm_score: scoreValue.nullable().optional(),
  final_score: scoreValue.nullable().optional(),
  average_score: scoreValue.nullable().optional(),
  teacher_comment: z.string().trim().max(1000).nullable().optional(),
});

export const saveRewardDisciplineSchema = z.object({
  student_id: z.string().trim().min(1, 'student_id is required'),
  semester_id: z.string().trim().min(1).optional(),
  school_year: z.string().trim().min(1).optional(),
  type: z.enum(['reward', 'discipline']),
  title: z.string().trim().min(1, 'title is required').max(255),
  content: z.string().trim().min(1, 'content is required').max(2000),
  date: dateRegex,
  issuer: z.string().trim().max(255).nullable().optional(),
});

export const listScoresQuerySchema = z.object({
  student_id: z.string().trim().optional(),
  student: z.string().trim().optional(),
  class_name: z.string().trim().optional(),
  class: z.string().trim().optional(),
  school_year: z.string().trim().optional(),
  academic_year: z.string().trim().optional(),
  semester: z.string().trim().optional(),
  semester_id: z.string().trim().optional(),
  semester_code: z.string().trim().optional(),
  subject_id: z.string().trim().optional(),
  subject: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional(),
  page_size: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().trim().optional(),
});

export function validateSaveScore(value: unknown): SaveScoreDto {
  return parseSchema(saveScoreSchema, value);
}

export function validateSaveRewardDiscipline(
  value: unknown,
): SaveRewardDisciplineDto {
  return parseSchema(saveRewardDisciplineSchema, value);
}

export function validateListScores(value: unknown): ListScoresQueryDto {
  return parseSchema(listScoresQuerySchema, value);
}

function parseSchema<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new BadRequestException({
      message: 'Validation failed',
      issues: result.error.issues,
    });
  }
  return result.data;
}
