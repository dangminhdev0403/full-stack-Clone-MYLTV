type ScoreStatInput = { average_score?: number | null };

export function summarizeScores(items: ScoreStatInput[]) {
  const values = items.flatMap((item) => typeof item.average_score === "number" ? [item.average_score] : []);
  return { subjects: items.length, graded: values.length, average: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 100) / 100 : null, belowFive: values.filter((value) => value < 5).length };
}
