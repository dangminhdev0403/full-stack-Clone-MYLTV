import { useMutation, useQuery } from "@tanstack/react-query";
import { feedbackResource } from "../service/feedback.resource";

const feedback = feedbackResource.bind();

export function useFeedbackQuery() {
  return useQuery(feedback.queries.list.options());
}

export function useUpdateFeedbackStatusMutation() {
  return useMutation(feedback.mutations.updateStatus.options());
}
