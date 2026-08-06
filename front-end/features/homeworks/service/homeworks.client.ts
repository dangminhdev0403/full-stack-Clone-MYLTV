import { z } from "zod";
import { parseApiResponse, successSchema } from "@/lib/api/schemas";

export const homeworkItemSchema = z.object({
  id: z.string(),
  subject: z.string(),
  title: z.string(),
  content: z.string(),
  teacher: z.string(),
  assigned_at: z.string(),
  deadline: z.string(),
  status: z.string(),
  target_type: z.enum(["class", "students"]),
  class_id: z.string().nullable(),
  student_ids: z.array(z.string()),
  archived_at: z.string().nullable(),
  progress: z.object({
    assigned: z.number(),
    submitted: z.number(),
    pending: z.number(),
  }),
});
const homeworkListSchema = successSchema(
  z.object({
    items: z.array(homeworkItemSchema),
    page: z.number(),
    page_size: z.number(),
    total: z.number(),
    has_next: z.boolean(),
  }),
);
export type HomeworkItem = z.infer<typeof homeworkItemSchema>;
export type HomeworkQuery = {
  q?: string;
  class_id?: string;
  include_archived?: boolean;
};
export type CreateHomeworkPayload = {
  target_type: "class" | "students";
  class_id?: string;
  student_ids?: string[];
  subject: string;
  title: string;
  content: string;
  teacher: string;
  deadline: string;
};
export type UpdateHomeworkPayload = Partial<
  Pick<
    CreateHomeworkPayload,
    "subject" | "title" | "content" | "teacher" | "deadline"
  >
>;

export async function listHomeworks(query: HomeworkQuery = {}) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.class_id) params.set("class_id", query.class_id);
  if (query.include_archived) params.set("include_archived", "true");
  const response = await fetch(`/api/admin/homeworks?${params}`, {
    cache: "no-store",
  });
  return (await parseApiResponse(response, homeworkListSchema)).data;
}
export async function createHomework(payload: CreateHomeworkPayload) {
  const response = await fetch("/api/admin/homeworks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(homeworkItemSchema)))
    .data;
}
export async function updateHomework(
  id: string,
  payload: UpdateHomeworkPayload,
) {
  const response = await fetch(
    `/api/admin/homeworks/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  return (await parseApiResponse(response, successSchema(homeworkItemSchema)))
    .data;
}
export async function archiveHomework(id: string) {
  const response = await fetch(
    `/api/admin/homeworks/${encodeURIComponent(id)}/archive`,
    { method: "POST" },
  );
  return (await parseApiResponse(response, successSchema(homeworkItemSchema)))
    .data;
}
