import { createResource, defineMutation, defineQuery } from "@dangminhdev04032005/query-resource";
import { createNotification, listNotifications, type CreateNotificationPayload } from "./notifications.client";

export const notificationsResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "notifications",
  scopeKey: () => ["admin"],
  queries: {
    list: defineQuery({
      inputKey: (query?: string) => [query ?? ""],
      queryFn: ({ input }) => listNotifications(input),
    }),
  },
  mutations: {
    create: defineMutation({
      mutationFn: ({ variables }: { variables: CreateNotificationPayload }) => createNotification(variables),
      invalidates: [{ type: "query", operation: "list" }],
    }),
  },
});
