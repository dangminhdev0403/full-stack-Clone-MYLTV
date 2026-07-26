import { createResource, defineMutation, defineQuery } from "@dangminhdev04032005/query-resource";
import { getFeedback, listFeedback, updateFeedbackStatus, type FeedbackListQuery, type FeedbackStatus } from "./feedback.client";

export const feedbackResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "feedback",
  scopeKey: () => ["admin"],
  queries: {
    list: defineQuery({
      inputKey: (query: FeedbackListQuery = {}) => [query.page ?? 1, query.page_size ?? 20, query.q ?? "", query.status ?? ""],
      queryFn: ({ input }) => listFeedback(input),
    }),
    detail: defineQuery({ inputKey: (id: string) => [id], queryFn: ({ input }) => getFeedback(input) }),
  },
  mutations: {
    updateStatus: defineMutation({
      mutationFn: ({ variables }: { variables: { id: string; status: FeedbackStatus } }) => updateFeedbackStatus(variables.id, variables.status),
      invalidates: [{ type: "query", operation: "list" }, { type: "query", operation: "detail" }],
    }),
  },
});
