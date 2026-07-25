import { useMutation, useQuery } from "@tanstack/react-query";
import { notificationsResource } from "../service/notifications.resource";

const notifications = notificationsResource.bind();

export function useNotificationsQuery(query = "") {
  return useQuery(notifications.queries.list.options(query));
}

export function useCreateNotificationMutation() {
  return useMutation(notifications.mutations.create.options());
}
