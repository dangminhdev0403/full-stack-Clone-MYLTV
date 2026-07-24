import { useMutation, useQuery } from "@tanstack/react-query";
import { newsResource } from "../service/news.resource";

const news = newsResource.bind();

export function useNewsQuery(query = "") {
  return useQuery(news.queries.list.options(query));
}

export function useNewsDetailQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    ...news.queries.detail.options(id),
    enabled: options?.enabled ?? Boolean(id),
  });
}

export function useCreateNewsMutation() {
  return useMutation(news.mutations.create.options());
}

export function useUpdateNewsMutation() {
  return useMutation(news.mutations.update.options());
}

export function usePublishNewsMutation() {
  return useMutation(news.mutations.publish.options());
}

export function useHideNewsMutation() {
  return useMutation(news.mutations.hide.options());
}

export function usePinNewsMutation() {
  return useMutation(news.mutations.pin.options());
}

export function useReorderNewsMutation() {
  return useMutation(news.mutations.reorder.options());
}
