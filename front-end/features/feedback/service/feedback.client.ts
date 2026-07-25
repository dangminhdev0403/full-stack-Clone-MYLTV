import { z } from "zod";
import { parseApiResponse, successSchema } from "@/lib/api/schemas";

export const feedbackItemSchema = z.object({
  id: z.string(),
  student_id: z.string().nullable().optional(),
  account_id: z.string().nullable().optional(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  status: z.enum(["new", "in_progress", "resolved"]),
  created_at: z.string(),
});

const feedbackListSchema = z.array(feedbackItemSchema).or(successSchema(z.array(feedbackItemSchema)));

export type FeedbackItem = z.infer<typeof feedbackItemSchema>;

export async function listFeedback(): Promise<FeedbackItem[]> {
  const response = await fetch("/api/admin/feedback", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch feedback list");
  }
  const json = await response.json();
  if (Array.isArray(json)) return json;
  if (json.success && Array.isArray(json.data)) return json.data;
  return json.data || [];
}

export async function updateFeedbackStatus(id: string, status: "new" | "in_progress" | "resolved"): Promise<FeedbackItem> {
  const response = await fetch(`/api/admin/feedback/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error("Failed to update feedback status");
  }
  const json = await response.json();
  return json.data ?? json;
}
