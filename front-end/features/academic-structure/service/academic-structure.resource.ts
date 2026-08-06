import { createResource, defineMutation, defineQuery } from "@dangminhdev04032005/query-resource";
import { createAcademicYear, createSemester, getCurrentAcademicContext, listAcademicYears, listSemesters, setAcademicYearCurrent, setSemesterCurrent, updateAcademicYear, updateSemester, type CreateAcademicYearPayload, type CreateSemesterPayload, type UpdateAcademicYearPayload, type UpdateSemesterPayload } from "./academic-structure.client";

export const academicStructureResource = createResource<void>()({
  namespace: ["clone-myltv"], name: "academic-structure", scopeKey: () => ["admin"],
  queries: {
    current: defineQuery({ inputKey: (input?: void) => ["current", input], queryFn: () => getCurrentAcademicContext() }),
    years: defineQuery({ inputKey: (input?: void) => ["years", input], queryFn: () => listAcademicYears() }),
    semesters: defineQuery({ inputKey: (id?: string) => [id ?? "all"], queryFn: ({ input }) => listSemesters(input === "all" ? undefined : input) }),
  },
  mutations: {
    createYear: defineMutation({ mutationFn: ({ variables }: { variables: CreateAcademicYearPayload }) => createAcademicYear(variables), invalidates: [{ type: "query", operation: "current" }, { type: "query", operation: "years" }] }),
    updateYear: defineMutation({ mutationFn: ({ variables }: { variables: { id: string; payload: UpdateAcademicYearPayload } }) => updateAcademicYear(variables.id, variables.payload), invalidates: [{ type: "query", operation: "current" }, { type: "query", operation: "years" }] }),
    setYearCurrent: defineMutation({ mutationFn: ({ variables }: { variables: { id: string } }) => setAcademicYearCurrent(variables.id), invalidates: [{ type: "query", operation: "current" }, { type: "query", operation: "years" }, { type: "query", operation: "semesters" }] }),
    createSemester: defineMutation({ mutationFn: ({ variables }: { variables: CreateSemesterPayload }) => createSemester(variables), invalidates: [{ type: "query", operation: "current" }, { type: "query", operation: "semesters" }] }),
    updateSemester: defineMutation({ mutationFn: ({ variables }: { variables: { id: string; payload: UpdateSemesterPayload } }) => updateSemester(variables.id, variables.payload), invalidates: [{ type: "query", operation: "current" }, { type: "query", operation: "semesters" }] }),
    setSemesterCurrent: defineMutation({ mutationFn: ({ variables }: { variables: { id: string } }) => setSemesterCurrent(variables.id), invalidates: [{ type: "query", operation: "current" }, { type: "query", operation: "years" }, { type: "query", operation: "semesters" }] }),
  },
});
