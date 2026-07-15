import { z } from "zod";
import { parseApiResponse, studentSchema, successSchema } from "@/lib/api/schemas";

const listSchema = successSchema(z.object({ items: z.array(studentSchema), page: z.number(), page_size: z.number(), total: z.number(), has_next: z.boolean() }));
export type Student = z.infer<typeof studentSchema>;
export type StudentWritePayload = Partial<Pick<Student, "code" | "full_name" | "avatar_url" | "grade" | "class_name" | "school_name" | "is_active">> & {
  guardian_account_ids?: string[];
};

export async function listStudents(query = ""): Promise<z.infer<typeof listSchema>["data"]> {
  const response = await fetch(`/api/admin/students${query}`, { cache: "no-store" });
  return (await parseApiResponse(response, listSchema)).data;
}

export async function getStudent(id: string): Promise<Student> {
  const response = await fetch(`/api/admin/students/${encodeURIComponent(id)}`, { cache: "no-store" });
  return (await parseApiResponse(response, successSchema(studentSchema))).data;
}

export async function createStudent(payload: StudentWritePayload): Promise<Student> {
  const response = await mutate("/api/admin/students", "POST", payload);
  return (await parseApiResponse(response, successSchema(studentSchema))).data;
}

export async function updateStudent(id: string, payload: StudentWritePayload): Promise<Student> {
  const response = await mutate(`/api/admin/students/${encodeURIComponent(id)}`, "PATCH", payload);
  return (await parseApiResponse(response, successSchema(studentSchema))).data;
}

export async function replaceStudentAccounts(id: string, accountIds: string[]): Promise<{ updated: true }> {
  const response = await mutate(`/api/admin/students/${encodeURIComponent(id)}/accounts`, "PUT", { account_ids: accountIds });
  return (await parseApiResponse(response, successSchema(z.object({ updated: z.literal(true) })))).data;
}

function mutate(path: string, method: "POST" | "PATCH" | "PUT", payload: unknown): Promise<Response> {
  return fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
