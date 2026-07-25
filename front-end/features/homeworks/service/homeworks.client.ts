import { z } from "zod";
import { parseApiResponse, successSchema } from "@/lib/api/schemas";

export const homeworkItemSchema = z.object({
  id: z.string(),
  student_id: z.string().optional(),
  subject: z.string(),
  title: z.string(),
  content: z.string(),
  teacher: z.string(),
  deadline: z.string(),
  status: z.string(),
});

const homeworkListSchema = successSchema(
  z.object({
    items: z.array(homeworkItemSchema),
    total: z.number().optional(),
    page: z.number().optional(),
    page_size: z.number().optional(),
  })
);

export type HomeworkItem = z.infer<typeof homeworkItemSchema>;
export type CreateHomeworkPayload = {
  student_id: string;
  subject: string;
  title: string;
  content: string;
  teacher: string;
  deadline: string;
};

export async function listStudentHomeworks(studentId: string): Promise<{ items: HomeworkItem[] }> {
  const response = await fetch(`/api/admin/homeworks/${encodeURIComponent(studentId)}`, { cache: "no-store" });
  if (!response.ok) return { items: [] };
  const parsed = await parseApiResponse(response, homeworkListSchema);
  return { items: parsed.data.items };
}

export async function createHomework(payload: CreateHomeworkPayload): Promise<HomeworkItem> {
  const response = await fetch("/api/admin/homeworks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(homeworkItemSchema))).data;
}
