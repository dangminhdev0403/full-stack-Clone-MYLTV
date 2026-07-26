import { z } from "zod";
import { parseApiResponse, successSchema } from "@/lib/api/schemas";

export const feedbackStatusSchema = z.enum(["new", "in_progress", "resolved"]);
export const feedbackListQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  page_size: z.number().int().positive().max(100).optional(),
  q: z.string().trim().min(1).optional(),
  status: feedbackStatusSchema.optional(),
}).strict();
export const feedbackItemSchema = z.object({
  id: z.string(),
  student_id: z.string().nullable(),
  account_id: z.string().nullable(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  status: feedbackStatusSchema,
  attachments: z.array(z.unknown()),
  created_at: z.string(),
  updated_at: z.string(),
});
const feedbackListSchema = z.object({
  items: z.array(feedbackItemSchema),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  has_next: z.boolean(),
});

export type FeedbackItem = z.infer<typeof feedbackItemSchema>;
export type FeedbackStatus = z.infer<typeof feedbackStatusSchema>;
export type FeedbackList = z.infer<typeof feedbackListSchema>;
export type FeedbackListQuery = z.infer<typeof feedbackListQuerySchema>;

export async function listFeedback(query: FeedbackListQuery = {}): Promise<FeedbackList> {
  const parsed = feedbackListQuerySchema.parse(query);
  const params = new URLSearchParams();
  if (parsed.page !== undefined) params.set("page", String(parsed.page));
  if (parsed.page_size !== undefined) params.set("page_size", String(parsed.page_size));
  if (parsed.q !== undefined) params.set("q", parsed.q);
  if (parsed.status !== undefined) params.set("status", parsed.status);
  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  const response = await fetch(`/api/admin/feedback${suffix}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch feedback list");
  return (await parseApiResponse(response, successSchema(feedbackListSchema))).data;
}

export async function getFeedback(id: string): Promise<FeedbackItem> {
  const response = await fetch(`/api/admin/feedback/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch feedback detail");
  return (await parseApiResponse(response, successSchema(feedbackItemSchema))).data;
}

export async function updateFeedbackStatus(id: string, status: FeedbackStatus): Promise<FeedbackItem> {
  const response = await fetch(`/api/admin/feedback/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update feedback status");
  return (await parseApiResponse(response, successSchema(feedbackItemSchema))).data;
}
