import { createResource, defineMutation, defineQuery } from "@dangminhdev04032005/query-resource";
import { getStudentRewards, getStudentScores, saveRewardDiscipline, saveScore, type RewardDiscipline, type ScoreRecord } from "./scores.client";

export const scoresResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "scores",
  scopeKey: () => ["admin"],
  queries: {
    scoresList: defineQuery({
      inputKey: (studentId: string) => [studentId],
      queryFn: ({ input }) => getStudentScores(input),
    }),
    rewardsList: defineQuery({
      inputKey: (studentId: string) => [studentId],
      queryFn: ({ input }) => getStudentRewards(input),
    }),
  },
  mutations: {
    saveScore: defineMutation({
      mutationFn: ({ variables }: { variables: ScoreRecord }) => saveScore(variables),
      invalidates: [{ type: "query", operation: "scoresList" }],
    }),
    saveReward: defineMutation({
      mutationFn: ({ variables }: { variables: Partial<RewardDiscipline> & { student_id: string } }) => saveRewardDiscipline(variables),
      invalidates: [{ type: "query", operation: "rewardsList" }],
    }),
  },
});
