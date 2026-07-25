import { createResource, defineMutation, defineQuery } from "@dangminhdev04032005/query-resource";
import { createAdminEvent, deleteAdminEvent, listAdminEvents, type CreateEventPayload } from "./events.client";

export const eventsResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "events",
  scopeKey: () => ["admin"],
  queries: {
    list: defineQuery({
      inputKey: (query?: string) => [query ?? ""],
      queryFn: ({ input }) => listAdminEvents(input),
    }),
  },
  mutations: {
    create: defineMutation({
      mutationFn: ({ variables }: { variables: CreateEventPayload }) => createAdminEvent(variables),
      invalidates: [{ type: "query", operation: "list" }],
    }),
    delete: defineMutation({
      mutationFn: ({ variables }: { variables: { id: string } }) => deleteAdminEvent(variables.id),
      invalidates: [{ type: "query", operation: "list" }],
    }),
  },
});
