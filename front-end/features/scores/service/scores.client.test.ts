import { afterEach, describe, expect, it, vi } from "vitest";
import { getStudentScoreSummary } from "./scores.client";

afterEach(() => vi.unstubAllGlobals());

describe("scores client", () => {
  it("loads protected student scores through the admin BFF", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: {
        student_id: "student-1",
        school_year: "2026-2027",
        semester: "1",
        subjects: [{
          subject_id: "math", subject_name: "Toán", oral_scores: [8],
          fifteen_minute_scores: [9], midterm_score: 8, final_score: 9,
          average_score: 8.5, teacher_comment: "Tốt",
        }],
      },
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getStudentScoreSummary("student-1");

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/students/student-1/scores", { cache: "no-store" });
    expect(result.subjects[0].subject_name).toBe("Toán");
  });
});