import { useMutation, useQuery } from "@tanstack/react-query";
import { notificationsResource } from "../service/notifications.resource";

const notifications = notificationsResource.bind();
export function useNotificationsQuery(query = "") { return useQuery(notifications.queries.list.options(query)); }
export function useNotificationDetailQuery(id: string, options?: { enabled?: boolean }) { return useQuery({ ...notifications.queries.detail.options(id), enabled: options?.enabled ?? Boolean(id) }); }
export function useCreateNotificationMutation() { return useMutation(notifications.mutations.create.options()); }
export function useUpdateNotificationMutation() { return useMutation(notifications.mutations.update.options()); }
