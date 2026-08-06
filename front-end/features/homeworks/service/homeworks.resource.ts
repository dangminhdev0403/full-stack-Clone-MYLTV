import {
  createResource,
  defineMutation,
  defineQuery,
} from "@dangminhdev04032005/query-resource";
import {
  archiveHomework,
  createHomework,
  listHomeworks,
  updateHomework,
  type CreateHomeworkPayload,
  type HomeworkQuery,
  type UpdateHomeworkPayload,
} from "./homeworks.client";
const list = { type: "query" as const, operation: "list" as const };
export const homeworksResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "homeworks",
  scopeKey: () => ["admin"],
  queries: {
    list: defineQuery({
      inputKey: (input: HomeworkQuery) => [input],
      queryFn: ({ input }) => listHomeworks(input),
    }),
  },
  mutations: {
    create: defineMutation({
      mutationFn: ({ variables }: { variables: CreateHomeworkPayload }) =>
        createHomework(variables),
      invalidates: [list],
    }),
    update: defineMutation({
      mutationFn: ({
        variables,
      }: {
        variables: { id: string; payload: UpdateHomeworkPayload };
      }) => updateHomework(variables.id, variables.payload),
      invalidates: [list],
    }),
    archive: defineMutation({
      mutationFn: ({ variables }: { variables: string }) =>
        archiveHomework(variables),
      invalidates: [list],
    }),
  },
});
