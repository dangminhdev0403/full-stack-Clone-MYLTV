import { createResource, defineQuery } from "@dangminhdev04032005/query-resource";
import { getStudentBusRoute } from "./student-transport.client";

export const studentTransportResource = createResource<void>()({
  namespace: ["clone-myltv"], name: "student-transport", scopeKey: () => ["admin"],
  queries: { detail: defineQuery({ inputKey: (studentId: string) => [studentId], queryFn: ({ input }) => getStudentBusRoute(input) }) },
});