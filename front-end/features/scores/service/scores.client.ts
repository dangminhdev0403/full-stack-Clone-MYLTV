import { z } from "zod";
import { parseApiResponse, studentScoresSchema, successSchema } from "@/lib/api/schemas";

export const scoreRecordSchema = z.object({
  id: z.string().optional(),
  student_id: z.string(),
  subject_id: z.string(),
  subject_name: z.string(),
  oral_scores: z.array(z.number()).optional(),
  fifteen_min_scores: z.array(z.number()).optional(),
  midterm_score: z.number().nullable().optional(),
  final_score: z.number().nullable().optional(),
  average_score: z.number().nullable().optional(),
  teacher_comment: z.string().nullable().optional(),
});

export const rewardDisciplineSchema = z.object({
  id: z.string(),
  type: z.enum(["reward", "discipline"]),
  title: z.string(),
  content: z.string(),
  date: z.string(),
  issuer: z.string().nullable().optional(),
});

export type ScoreRecord = z.infer<typeof scoreRecordSchema>;
export type RewardDiscipline = z.infer<typeof rewardDisciplineSchema>;
export type StudentScoreSummary = z.infer<typeof studentScoresSchema>;

export async function getStudentScoreSummary(studentId: string): Promise<StudentScoreSummary> {
  const response = await fetch(`/api/admin/students/${encodeURIComponent(studentId)}/scores`, { cache: "no-store" });
  return (await parseApiResponse(response, successSchema(studentScoresSchema))).data;
}

export async function getStudentScores(studentId: string): Promise<ScoreRecord[]> {
  const response = await fetch(`/api/admin/scores/${encodeURIComponent(studentId)}`, { cache: "no-store" });
  if (!response.ok) return [];
  const parsed = await parseApiResponse(response, successSchema(z.array(scoreRecordSchema)));
  return parsed.data;
}

export async function getStudentRewards(studentId: string): Promise<RewardDiscipline[]> {
  const response = await fetch(`/api/admin/scores/${encodeURIComponent(studentId)}/reward-discipline`, { cache: "no-store" });
  if (!response.ok) return [];
  const parsed = await parseApiResponse(response, successSchema(z.array(rewardDisciplineSchema)));
  return parsed.data;
}

export async function saveScore(payload: ScoreRecord): Promise<ScoreRecord> {
  const response = await fetch("/api/admin/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(scoreRecordSchema))).data;
}

export async function saveRewardDiscipline(payload: Partial<RewardDiscipline> & { student_id: string }): Promise<RewardDiscipline> {
  const response = await fetch("/api/admin/scores/reward-discipline", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(rewardDisciplineSchema))).data;
}
