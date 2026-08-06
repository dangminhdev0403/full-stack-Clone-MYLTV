import { describe, expect, it } from "vitest";
import { summarizeScores } from "./score-statistics";

describe("summarizeScores", () => {
  it("uses only available subject averages", () => {
    expect(summarizeScores([{ average_score: 8 }, { average_score: 6.5 }, { average_score: null }])).toEqual({ subjects: 3, graded: 2, average: 7.25, belowFive: 0 });
  });
});