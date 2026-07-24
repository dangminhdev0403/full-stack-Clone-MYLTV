import {
  createResource,
  defineMutation,
  defineQuery,
} from "@dangminhdev04032005/query-resource";
import {
  createAttendanceSession,
  listAttendanceSessions,
  updateAttendanceSession,
  type AttendanceWritePayload,
} from "./attendance.client";

export const attendanceResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "attendance",
  scopeKey: () => ["admin"],
  queries: {
    list: defineQuery({
      inputKey: (query?: string) => [query ?? ""],
      queryFn: ({ input }) => listAttendanceSessions(input),
    }),
  },
  mutations: {
    create: defineMutation({
      mutationFn: ({ variables }: { variables: AttendanceWritePayload }) =>
        createAttendanceSession(variables),
      invalidates: [{ type: "query", operation: "list" }],
    }),
    update: defineMutation({
      mutationFn: ({
        variables,
      }: {
        variables: { id: string; payload: AttendanceWritePayload };
      }) => updateAttendanceSession(variables.id, variables.payload),
      invalidates: [{ type: "query", operation: "list" }],
    }),
  },
});
