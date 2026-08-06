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

export const gradeLevelSchema = z.object({
  id: z.string(),
  code: z.string(),
  display_name: z.string(),
  sort_order: z.number(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const schoolClassSchema = z.object({
  id: z.string(),
  academic_year_id: z.string(),
  grade_level_id: z.string(),
  code: z.string(),
  display_name: z.string(),
  homeroom_teacher_id: z.string().nullable().optional(),
  is_active: z.boolean(),
  academic_year: z
    .object({
      id: z.string(),
      code: z.string(),
      display_name: z.string(),
      starts_on: z.string(),
      ends_on: z.string(),
      is_current: z.boolean(),
    })
    .optional(),
  grade_level: z
    .object({
      id: z.string(),
      code: z.string(),
      display_name: z.string(),
      sort_order: z.number(),
    })
    .optional(),
  homeroom_teacher: z
    .object({
      id: z.string(),
      username: z.string(),
      display_name: z.string(),
      role: z.string(),
      is_active: z.boolean(),
    })
    .nullable()
    .optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const classEnrollmentSchema = z.object({
  id: z.string(),
  student_id: z.string(),
  class_id: z.string(),
  starts_on: z.string().nullable().optional(),
  ends_on: z.string().nullable().optional(),
  is_active: z.boolean(),
  student: z
    .object({
      id: z.string(),
      code: z.string(),
      full_name: z.string(),
      grade: z.string().nullable().optional(),
      class_name: z.string(),
      is_active: z.boolean(),
    })
    .optional(),
  class: schoolClassSchema.optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type GradeLevel = z.infer<typeof gradeLevelSchema>;
export type SchoolClass = z.infer<typeof schoolClassSchema>;
export type ClassEnrollment = z.infer<typeof classEnrollmentSchema>;

export type CreateGradeLevelPayload = {
  id?: string;
  code: string;
  display_name: string;
  sort_order?: number;
};

export type UpdateGradeLevelPayload = Partial<Omit<CreateGradeLevelPayload, "id">>;

export type ListClassesQuery = {
  academic_year_id?: string;
  grade_level_id?: string;
  is_active?: boolean;
};

export type CreateSchoolClassPayload = {
  id?: string;
  academic_year_id: string;
  grade_level_id: string;
  code: string;
  display_name: string;
  homeroom_teacher_id?: string | null;
  is_active?: boolean;
};

export type UpdateSchoolClassPayload = Partial<Omit<CreateSchoolClassPayload, "id">>;

export type AssignStudentEnrollmentPayload = {
  student_id: string;
  starts_on?: string;
};

export const gradeLevelsListSchema = successSchema(
  z.object({
    grade_levels: z.array(gradeLevelSchema),
  })
);

export const classesListSchema = successSchema(
  z.object({
    classes: z.array(schoolClassSchema),
  })
);

export const classRosterSchema = successSchema(
  z.object({
    class_id: z.string(),
    class_name: z.string(),
    class_code: z.string(),
    enrollments: z.array(classEnrollmentSchema),
  })
);

export async function listGradeLevels(): Promise<GradeLevel[]> {
  const response = await fetch("/api/admin/academic-structure/grade-levels", { cache: "no-store" });
  return (await parseApiResponse(response, gradeLevelsListSchema)).data.grade_levels;
}

export async function createGradeLevel(payload: CreateGradeLevelPayload): Promise<GradeLevel> {
  const response = await fetch("/api/admin/academic-structure/grade-levels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(gradeLevelSchema))).data;
}

export async function updateGradeLevel(id: string, payload: UpdateGradeLevelPayload): Promise<GradeLevel> {
  const response = await fetch(`/api/admin/academic-structure/grade-levels/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(gradeLevelSchema))).data;
}

export async function listClasses(query?: ListClassesQuery): Promise<SchoolClass[]> {
  const params = new URLSearchParams();
  if (query?.academic_year_id) params.set("academic_year_id", query.academic_year_id);
  if (query?.grade_level_id) params.set("grade_level_id", query.grade_level_id);
  if (query?.is_active !== undefined) params.set("is_active", String(query.is_active));
  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`/api/admin/academic-structure/classes${queryString}`, { cache: "no-store" });
  return (await parseApiResponse(response, classesListSchema)).data.classes;
}

export async function createSchoolClass(payload: CreateSchoolClassPayload): Promise<SchoolClass> {
  const response = await fetch("/api/admin/academic-structure/classes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(schoolClassSchema))).data;
}

export async function updateSchoolClass(id: string, payload: UpdateSchoolClassPayload): Promise<SchoolClass> {
  const response = await fetch(`/api/admin/academic-structure/classes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(schoolClassSchema))).data;
}

export async function getClassRoster(
  classId: string,
  isActive?: boolean
): Promise<{ class_id: string; class_name: string; class_code: string; enrollments: ClassEnrollment[] }> {
  const query = isActive !== undefined ? `?is_active=${isActive}` : "";
  const response = await fetch(`/api/admin/academic-structure/classes/${encodeURIComponent(classId)}/roster${query}`, {
    cache: "no-store",
  });
  return (await parseApiResponse(response, classRosterSchema)).data;
}

export async function assignStudentEnrollment(
  classId: string,
  payload: AssignStudentEnrollmentPayload
): Promise<ClassEnrollment> {
  const response = await fetch(`/api/admin/academic-structure/classes/${encodeURIComponent(classId)}/enrollments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(classEnrollmentSchema))).data;
}

export async function deactivateStudentEnrollment(classId: string, studentId: string): Promise<ClassEnrollment> {
  const response = await fetch(
    `/api/admin/academic-structure/classes/${encodeURIComponent(classId)}/enrollments/${encodeURIComponent(studentId)}/deactivate`,
    {
      method: "POST",
    }
  );
  return (await parseApiResponse(response, successSchema(classEnrollmentSchema))).data;
}

export type TransferStudentsPayload = {
  student_ids: string[];
  target_class_id: string;
  reason?: string;
};

export type PromoteCohortPayload = {
  source_class_id: string;
  target_class_id: string;
  student_ids?: string[];
};

export const transferStudentsResponseSchema = z.object({
  transferred_count: z.number(),
  target_class_id: z.string(),
  student_ids: z.array(z.string()),
});

export const promoteCohortResponseSchema = z.object({
  promoted_count: z.number(),
  source_class_id: z.string(),
  target_class_id: z.string(),
});

export type TransferStudentsResponse = z.infer<typeof transferStudentsResponseSchema>;
export type PromoteCohortResponse = z.infer<typeof promoteCohortResponseSchema>;

export async function transferStudents(payload: TransferStudentsPayload): Promise<TransferStudentsResponse> {
  const response = await fetch("/api/admin/academic-structure/transfers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(transferStudentsResponseSchema))).data;
}

export async function promoteCohort(payload: PromoteCohortPayload): Promise<PromoteCohortResponse> {
  const response = await fetch("/api/admin/academic-structure/promotions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(promoteCohortResponseSchema))).data;
}
