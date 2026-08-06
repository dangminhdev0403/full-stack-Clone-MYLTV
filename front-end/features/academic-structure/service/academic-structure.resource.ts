import { createResource, defineMutation, defineQuery } from "@dangminhdev04032005/query-resource";
import {
  assignStudentEnrollment, createAcademicYear, createGradeLevel, createSchoolClass,
  createSemester, deactivateStudentEnrollment, getClassRoster, getCurrentAcademicContext,
  listAcademicYears, listClasses, listGradeLevels, listSemesters, setAcademicYearCurrent,
  setSemesterCurrent, updateAcademicYear, updateGradeLevel, updateSchoolClass, updateSemester,
  type AssignStudentEnrollmentPayload, type CreateAcademicYearPayload, type CreateGradeLevelPayload,
  type CreateSchoolClassPayload, type CreateSemesterPayload, type ListClassesQuery,
  type UpdateAcademicYearPayload, type UpdateGradeLevelPayload, type UpdateSchoolClassPayload,
  type UpdateSemesterPayload,
} from "./academic-structure.client";

export const academicStructureResource = createResource<void>()({
  namespace: ["clone-myltv"], name: "academic-structure", scopeKey: () => ["admin"],
  queries: {
    current: defineQuery({ inputKey: (input?: void) => ["current", input], queryFn: () => getCurrentAcademicContext() }),
    years: defineQuery({ inputKey: (input?: void) => ["years", input], queryFn: () => listAcademicYears() }),
    semesters: defineQuery({ inputKey: (id?: string) => [id ?? "all"], queryFn: ({ input }) => listSemesters(input === "all" ? undefined : input) }),
    gradeLevels: defineQuery({ inputKey: (input?: void) => ["grade-levels", input], queryFn: () => listGradeLevels() }),
    classes: defineQuery({ inputKey: (q?: ListClassesQuery) => [q?.academic_year_id ?? "all-years", q?.grade_level_id ?? "all-grades", q?.is_active === undefined ? "all-status" : String(q.is_active)], queryFn: ({ input }) => listClasses(input) }),
    classRoster: defineQuery({ inputKey: (input: { classId: string; isActive?: boolean }) => [input.classId, input.isActive === undefined ? "all" : String(input.isActive)], queryFn: ({ input }) => getClassRoster(input.classId, input.isActive) }),
  },
  mutations: {
    createYear: defineMutation({ mutationFn: ({ variables }: { variables: CreateAcademicYearPayload }) => createAcademicYear(variables), invalidates: [{ type: "query", operation: "current" }, { type: "query", operation: "years" }] }),
    updateYear: defineMutation({ mutationFn: ({ variables }: { variables: { id: string; payload: UpdateAcademicYearPayload } }) => updateAcademicYear(variables.id, variables.payload), invalidates: [{ type: "query", operation: "current" }, { type: "query", operation: "years" }] }),
    setYearCurrent: defineMutation({ mutationFn: ({ variables }: { variables: { id: string } }) => setAcademicYearCurrent(variables.id), invalidates: [{ type: "query", operation: "current" }, { type: "query", operation: "years" }, { type: "query", operation: "semesters" }] }),
    createSemester: defineMutation({ mutationFn: ({ variables }: { variables: CreateSemesterPayload }) => createSemester(variables), invalidates: [{ type: "query", operation: "current" }, { type: "query", operation: "semesters" }] }),
    updateSemester: defineMutation({ mutationFn: ({ variables }: { variables: { id: string; payload: UpdateSemesterPayload } }) => updateSemester(variables.id, variables.payload), invalidates: [{ type: "query", operation: "current" }, { type: "query", operation: "semesters" }] }),
    setSemesterCurrent: defineMutation({ mutationFn: ({ variables }: { variables: { id: string } }) => setSemesterCurrent(variables.id), invalidates: [{ type: "query", operation: "current" }, { type: "query", operation: "years" }, { type: "query", operation: "semesters" }] }),
    createGradeLevel: defineMutation({ mutationFn: ({ variables }: { variables: CreateGradeLevelPayload }) => createGradeLevel(variables), invalidates: [{ type: "query", operation: "gradeLevels" }] }),
    updateGradeLevel: defineMutation({ mutationFn: ({ variables }: { variables: { id: string; payload: UpdateGradeLevelPayload } }) => updateGradeLevel(variables.id, variables.payload), invalidates: [{ type: "query", operation: "gradeLevels" }] }),
    createClass: defineMutation({ mutationFn: ({ variables }: { variables: CreateSchoolClassPayload }) => createSchoolClass(variables), invalidates: [{ type: "query", operation: "classes" }] }),
    updateClass: defineMutation({ mutationFn: ({ variables }: { variables: { id: string; payload: UpdateSchoolClassPayload } }) => updateSchoolClass(variables.id, variables.payload), invalidates: [{ type: "query", operation: "classes" }] }),
    assignEnrollment: defineMutation({ mutationFn: ({ variables }: { variables: { classId: string; payload: AssignStudentEnrollmentPayload } }) => assignStudentEnrollment(variables.classId, variables.payload), invalidates: [{ type: "query", operation: "classRoster" }, { type: "query", operation: "classes" }] }),
    deactivateEnrollment: defineMutation({ mutationFn: ({ variables }: { variables: { classId: string; studentId: string } }) => deactivateStudentEnrollment(variables.classId, variables.studentId), invalidates: [{ type: "query", operation: "classRoster" }, { type: "query", operation: "classes" }] }),
  },
});
