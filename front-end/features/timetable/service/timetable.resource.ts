import { createResource, defineMutation, defineQuery } from "@dangminhdev04032005/query-resource";
import { getAdminTimetable, saveTimetable, type SaveTimetablePayload, type TimetableScope } from "./timetable.client";

export const timetableResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "timetable",
  scopeKey: () => ["admin"],
  queries: {
    getAdmin: defineQuery({
      inputKey: (scope: TimetableScope) => [scope.class_id, scope.semester_id, scope.week_start],
      queryFn: ({ input }) => getAdminTimetable(input),
    }),
  },
  mutations: {
    save: defineMutation({
      mutationFn: ({ variables }: { variables: SaveTimetablePayload }) => saveTimetable(variables),
      invalidates: [{ type: "query", operation: "getAdmin" }],
    }),
  },
});
