import { useMutation, useQuery } from "@tanstack/react-query";
import { tuitionResource } from "../service/tuition.resource";

const tuition = tuitionResource.bind();

export function useTuitionListQuery(query = "", options?: { enabled?: boolean }) {
  return useQuery({
    ...tuition.queries.list.options(query),
    enabled: options?.enabled ?? true,
  });
}

export function useTuitionDetailQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    ...tuition.queries.detail.options(id),
    enabled: options?.enabled ?? Boolean(id),
  });
}

export function useCreateTuitionMutation() {
  return useMutation(tuition.mutations.create.options());
}

export function useUpdateTuitionMutation() {
  return useMutation(tuition.mutations.update.options());
}
