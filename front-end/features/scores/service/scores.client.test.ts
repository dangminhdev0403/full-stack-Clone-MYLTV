import { afterEach, describe, expect, it, vi } from "vitest";
import { getScores, getStudentScoreSummary } from "./scores.client";

afterEach(() => vi.unstubAllGlobals());

describe("scores client", () => {
  it("loads protected student scores through the admin BFF", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            student_id: "student-1",
            school_year: "2026-2027",
            semester: "1",
            subjects: [
              {
                subject_id: "math",
                subject_name: "Toán",
                oral_scores: [8],
                fifteen_minute_scores: [9],
                midterm_score: 8,
                final_score: 9,
                average_score: 8.5,
                teacher_comment: "Tốt",
              },
            ],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getStudentScoreSummary("student-1");

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/students/student-1/scores", { cache: "no-store" });
    expect(result.subjects[0].subject_name).toBe("Toán");
  });

  it("fetches admin scores list with filters", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              id: "score-1",
              student_id: "student-1",
              subject_id: "math",
              subject_name: "Toán Học",
              oral_scores: [8, 9],
              fifteen_min_scores: [8.5],
              midterm_score: 8,
              final_score: 9,
              average_score: 8.5,
              teacher_comment: "Tốt",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getScores({ student_id: "student-1", class_id: "class-1" });

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/scores?student_id=student-1&class_id=class-1", { cache: "no-store" });
    expect(result).toHaveLength(1);
    expect(result[0].subject_name).toBe("Toán Học");
  });

  it("throws error when fetch fails instead of swallowing as empty array", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          error: { code: "FORBIDDEN", message: "Không có quyền truy cập" },
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getScores({ student_id: "student-1" })).rejects.toThrow("Không có quyền truy cập");
  });
});