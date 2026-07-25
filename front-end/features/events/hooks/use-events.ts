import { useMutation, useQuery } from "@tanstack/react-query";
import { eventsResource } from "../service/events.resource";

const events = eventsResource.bind();

export function useAdminEventsQuery(query = "") {
  return useQuery(events.queries.list.options(query));
}

export function useCreateAdminEventMutation() {
  return useMutation(events.mutations.create.options());
}

export function useDeleteAdminEventMutation() {
  return useMutation(events.mutations.delete.options());
}
