import { createResource, defineMutation, defineQuery } from "@dangminhdev04032005/query-resource";
import { listFeedback, updateFeedbackStatus } from "./feedback.client";

export const feedbackResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "feedback",
  scopeKey: () => ["admin"],
  queries: {
    list: defineQuery({
      inputKey: (_?: void) => [""],
      queryFn: () => listFeedback(),
    }),
  },
  mutations: {
    updateStatus: defineMutation({
      mutationFn: ({ variables }: { variables: { id: string; status: "new" | "in_progress" | "resolved" } }) =>
        updateFeedbackStatus(variables.id, variables.status),
      invalidates: [{ type: "query", operation: "list" }],
    }),
  },
});
