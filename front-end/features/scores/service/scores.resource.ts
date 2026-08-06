import { createResource, defineMutation, defineQuery } from "@dangminhdev04032005/query-resource";
import {
  getScores,
  getStudentRewards,
  getStudentScores,
  getStudentScoreSummary,
  saveRewardDiscipline,
  saveScore,
  type RewardDiscipline,
  type ScoreFilters,
  type ScoreRecord,
} from "./scores.client";

export const scoresResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "scores",
  scopeKey: () => ["admin"],
  queries: {
    scoresList: defineQuery({
      inputKey: (filters?: ScoreFilters) => [
        filters?.student_id ?? "",
        filters?.class_id ?? "",
        filters?.academic_year_id ?? "",
        filters?.semester_id ?? "",
        filters?.subject_id ?? "",
      ],
      queryFn: ({ input }) => getScores(input),
    }),
    studentScoresList: defineQuery({
      inputKey: (studentId: string) => [studentId],
      queryFn: ({ input }) => getStudentScores(input),
    }),
    rewardsList: defineQuery({
      inputKey: (studentId: string) => [studentId],
      queryFn: ({ input }) => getStudentRewards(input),
    }),
    studentDetail: defineQuery({
      inputKey: (studentId: string) => [studentId],
      queryFn: ({ input }) => getStudentScoreSummary(input),
    }),
  },
  mutations: {
    saveScore: defineMutation({
      mutationFn: ({ variables }: { variables: ScoreRecord }) => saveScore(variables),
      invalidates: [
        { type: "query", operation: "scoresList" },
        { type: "query", operation: "studentScoresList" },
      ],
    }),
    saveReward: defineMutation({
      mutationFn: ({ variables }: { variables: Partial<RewardDiscipline> & { student_id: string } }) => saveRewardDiscipline(variables),
      invalidates: [{ type: "query", operation: "rewardsList" }],
    }),
  },
});
