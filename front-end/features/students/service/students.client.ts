import { z } from "zod";
import { parseApiResponse, studentDetailSchema, studentGuardianContactSchema, studentSummarySchema, successSchema } from "@/lib/api/schemas";

const listSchema = successSchema(z.object({ items: z.array(studentSummarySchema), page: z.number(), page_size: z.number(), total: z.number(), has_next: z.boolean() }));
export type StudentSummary = z.infer<typeof studentSummarySchema>;
export type StudentGuardianContact = z.infer<typeof studentGuardianContactSchema>;
export type StudentDetail = z.infer<typeof studentDetailSchema>;
export type Student = StudentSummary;
export type StudentWritePayload = Partial<Pick<StudentSummary, "code" | "full_name" | "avatar_url" | "grade" | "class_name" | "school_name" | "is_active">> & Partial<Pick<StudentDetail, "date_of_birth" | "gender" | "ethnicity" | "birth_place" | "permanent_address" | "cohort_start_year" | "cohort_end_year">> & {
  guardian_account_ids?: string[];
  guardian_contacts?: Array<Omit<StudentGuardianContact, "id"> & { id?: string }>;
};

export async function listStudents(query = ""): Promise<z.infer<typeof listSchema>["data"]> {
  const response = await fetch(`/api/admin/students${query}`, { cache: "no-store" });
  return (await parseApiResponse(response, listSchema)).data;
}

export async function getStudent(id: string): Promise<StudentDetail> {
  const response = await fetch(`/api/admin/students/${encodeURIComponent(id)}`, { cache: "no-store" });
  return (await parseApiResponse(response, successSchema(studentDetailSchema))).data;
}

export async function createStudent(payload: StudentWritePayload): Promise<StudentSummary> {
  const response = await mutate("/api/admin/students", "POST", payload);
  return (await parseApiResponse(response, successSchema(studentSummarySchema))).data;
}

export async function updateStudent(id: string, payload: StudentWritePayload): Promise<StudentDetail> {
  const response = await mutate(`/api/admin/students/${encodeURIComponent(id)}`, "PATCH", payload);
  return (await parseApiResponse(response, successSchema(studentDetailSchema))).data;
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
