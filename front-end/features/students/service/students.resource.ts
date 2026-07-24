import {
  createResource,
  defineMutation,
  defineQuery,
} from "@dangminhdev04032005/query-resource";
import {
  createStudent,
  getStudent,
  listStudents,
  replaceStudentAccounts,
  updateStudent,
  type StudentWritePayload,
} from "./students.client";

export const studentResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "students",
  scopeKey: () => ["admin"],
  queries: {
    list: defineQuery({
      inputKey: (query?: string) => [query ?? ""],
      queryFn: ({ input }) => listStudents(input),
    }),
    detail: defineQuery({
      inputKey: (id: string) => [id],
      queryFn: ({ input }) => getStudent(input),
    }),
  },
  mutations: {
    create: defineMutation({
      mutationFn: ({ variables }: { variables: StudentWritePayload }) =>
        createStudent(variables),
      invalidates: [{ type: "query", operation: "list" }],
    }),
    update: defineMutation({
      mutationFn: ({
        variables,
      }: {
        variables: { id: string; payload: StudentWritePayload };
      }) => updateStudent(variables.id, variables.payload),
      invalidates: [
        { type: "query", operation: "list" },
        { type: "query", operation: "detail" },
      ],
    }),
    replaceAccounts: defineMutation({
      mutationFn: ({
        variables,
      }: {
        variables: { id: string; accountIds: string[] };
      }) => replaceStudentAccounts(variables.id, variables.accountIds),
      invalidates: [
        { type: "query", operation: "list" },
        { type: "query", operation: "detail" },
      ],
    }),
  },
});
