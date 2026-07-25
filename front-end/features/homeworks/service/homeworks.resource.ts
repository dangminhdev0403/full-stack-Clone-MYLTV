import { createResource, defineMutation, defineQuery } from "@dangminhdev04032005/query-resource";
import { createHomework, listStudentHomeworks, type CreateHomeworkPayload } from "./homeworks.client";

export const homeworksResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "homeworks",
  scopeKey: () => ["admin"],
  queries: {
    list: defineQuery({
      inputKey: (studentId: string) => [studentId],
      queryFn: ({ input }) => listStudentHomeworks(input),
    }),
  },
  mutations: {
    create: defineMutation({
      mutationFn: ({ variables }: { variables: CreateHomeworkPayload }) => createHomework(variables),
      invalidates: [{ type: "query", operation: "list" }],
    }),
  },
});
