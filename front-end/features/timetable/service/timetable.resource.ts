import { createResource, defineMutation, defineQuery } from "@dangminhdev04032005/query-resource";
import { getStudentTimetable, saveTimetable, type SaveTimetablePayload } from "./timetable.client";

export const timetableResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "timetable",
  scopeKey: () => ["admin"],
  queries: {
    get: defineQuery({
      inputKey: (studentId: string) => [studentId],
      queryFn: ({ input }) => getStudentTimetable(input),
    }),
  },
  mutations: {
    save: defineMutation({
      mutationFn: ({ variables }: { variables: SaveTimetablePayload }) => saveTimetable(variables),
      invalidates: [{ type: "query", operation: "get" }],
    }),
  },
});
