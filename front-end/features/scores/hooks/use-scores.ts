import { useMutation, useQuery } from "@tanstack/react-query";
import { scoresResource } from "../service/scores.resource";

const scores = scoresResource.bind();

export function useStudentScoresQuery(studentId: string, options?: { enabled?: boolean }) {
  return useQuery({
    ...scores.queries.scoresList.options(studentId),
    enabled: options?.enabled ?? Boolean(studentId),
  });
}

export function useStudentRewardsQuery(studentId: string, options?: { enabled?: boolean }) {
  return useQuery({
    ...scores.queries.rewardsList.options(studentId),
    enabled: options?.enabled ?? Boolean(studentId),
  });
}

export function useStudentScoreSummaryQuery(studentId: string, enabled = true) {
  return useQuery({ ...scores.queries.studentDetail.options(studentId), enabled: enabled && Boolean(studentId) });
}

export function useSaveScoreMutation() {
  return useMutation(scores.mutations.saveScore.options());
}

export function useSaveRewardMutation() {
  return useMutation(scores.mutations.saveReward.options());
}
