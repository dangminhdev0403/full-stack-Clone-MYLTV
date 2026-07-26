import { useMutation, useQuery } from "@tanstack/react-query";
import type { FeedbackListQuery } from "../service/feedback.client";
import { feedbackResource } from "../service/feedback.resource";

const feedback = feedbackResource.bind();
export function useFeedbackQuery(query: FeedbackListQuery = {}) {
  return useQuery(feedback.queries.list.options(query));
}
export function useFeedbackDetailQuery(id: string, options: { enabled: boolean }) {
  return useQuery({ ...feedback.queries.detail.options(id), enabled: options.enabled });
}
export function useUpdateFeedbackStatusMutation() {
  return useMutation(feedback.mutations.updateStatus.options());
}
