import { z } from "zod";
import { parseApiResponse, successSchema } from "@/lib/api/schemas";

export const semesterSchema = z.object({
  id: z.string(),
  academic_year_id: z.string(),
  code: z.string(),
  display_name: z.string(),
  starts_on: z.string(),
  ends_on: z.string(),
  sort_order: z.number(),
  is_current: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const academicYearSchema = z.object({
  id: z.string(),
  code: z.string(),
  display_name: z.string(),
  starts_on: z.string(),
  ends_on: z.string(),
  is_current: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  semesters: z.array(semesterSchema).optional(),
});

export type AcademicYear = z.infer<typeof academicYearSchema>;
export type Semester = z.infer<typeof semesterSchema>;

export type CreateAcademicYearPayload = {
  id: string;
  code: string;
  display_name: string;
  starts_on: string;
  ends_on: string;
};

export type UpdateAcademicYearPayload = Partial<Omit<CreateAcademicYearPayload, "id">>;

export type CreateSemesterPayload = {
  id: string;
  academic_year_id: string;
  code: string;
  display_name: string;
  starts_on: string;
  ends_on: string;
  sort_order: number;
};

export type UpdateSemesterPayload = Partial<Omit<CreateSemesterPayload, "id" | "academic_year_id">>;

export const currentAcademicContextSchema = successSchema(
  z.object({
    academic_year: academicYearSchema.nullable().optional(),
    semester: semesterSchema.nullable().optional(),
  })
);

export const academicYearsListSchema = successSchema(
  z.object({
    academic_years: z.array(academicYearSchema),
  })
);

export const semestersListSchema = successSchema(
  z.object({
    semesters: z.array(semesterSchema),
  })
);

export async function getCurrentAcademicContext() {
  const response = await fetch("/api/admin/academic-context/current", { cache: "no-store" });
  return (await parseApiResponse(response, currentAcademicContextSchema)).data;
}

export async function listAcademicYears(): Promise<AcademicYear[]> {
  const response = await fetch("/api/admin/academic-context/years", { cache: "no-store" });
  return (await parseApiResponse(response, academicYearsListSchema)).data.academic_years;
}

export async function createAcademicYear(payload: CreateAcademicYearPayload): Promise<AcademicYear> {
  const response = await fetch("/api/admin/academic-context/years", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(academicYearSchema))).data;
}

export async function updateAcademicYear(id: string, payload: UpdateAcademicYearPayload): Promise<AcademicYear> {
  const response = await fetch(`/api/admin/academic-context/years/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(academicYearSchema))).data;
}

export async function setAcademicYearCurrent(id: string): Promise<AcademicYear> {
  const response = await fetch(`/api/admin/academic-context/years/${encodeURIComponent(id)}/set-current`, {
    method: "POST",
  });
  return (await parseApiResponse(response, successSchema(academicYearSchema))).data;
}

export async function listSemesters(academicYearId?: string): Promise<Semester[]> {
  const query = academicYearId ? `?academic_year_id=${encodeURIComponent(academicYearId)}` : "";
  const response = await fetch(`/api/admin/academic-context/semesters${query}`, { cache: "no-store" });
  return (await parseApiResponse(response, semestersListSchema)).data.semesters;
}

export async function createSemester(payload: CreateSemesterPayload): Promise<Semester> {
  const response = await fetch("/api/admin/academic-context/semesters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(semesterSchema))).data;
}

export async function updateSemester(id: string, payload: UpdateSemesterPayload): Promise<Semester> {
  const response = await fetch(`/api/admin/academic-context/semesters/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(semesterSchema))).data;
}

export async function setSemesterCurrent(id: string): Promise<Semester> {
  const response = await fetch(`/api/admin/academic-context/semesters/${encodeURIComponent(id)}/set-current`, {
    method: "POST",
  });
  return (await parseApiResponse(response, successSchema(semesterSchema))).data;
}
