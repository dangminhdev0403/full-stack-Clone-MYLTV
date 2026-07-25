import {
  createResource,
  defineQuery,
} from "@dangminhdev04032005/query-resource";
import { getCurrentAcademicContext } from "./academic-context.client";

export const academicContextResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "academic-context",
  scopeKey: () => ["admin"],
  queries: {
    current: defineQuery({
      inputKey: (_?: void) => ["current"],
      queryFn: () => getCurrentAcademicContext(),
    }),
  },
});
