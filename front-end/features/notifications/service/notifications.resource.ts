import { createResource, defineMutation, defineQuery } from "@dangminhdev04032005/query-resource";
import { createNotification, getNotification, listNotifications, updateNotification, type CreateNotificationPayload, type NotificationWritePayload } from "./notifications.client";

export const notificationsResource = createResource<void>()({
  namespace: ["clone-myltv"], name: "notifications", scopeKey: () => ["admin"],
  queries: {
    list: defineQuery({ inputKey: (query?: string) => [query ?? ""], queryFn: ({ input }) => listNotifications(input) }),
    detail: defineQuery({ inputKey: (id: string) => [id], queryFn: ({ input }) => getNotification(input) }),
  },
  mutations: {
    create: defineMutation({ mutationFn: ({ variables }: { variables: CreateNotificationPayload }) => createNotification(variables), invalidates: [{ type: "query", operation: "list" }] }),
    update: defineMutation({ mutationFn: ({ variables }: { variables: { id: string; payload: NotificationWritePayload } }) => updateNotification(variables.id, variables.payload), invalidates: [{ type: "query", operation: "list" }, { type: "query", operation: "detail" }] }),
  },
});
