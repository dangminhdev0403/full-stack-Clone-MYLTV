import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getStudentScoreSummary } from "@/features/scores/service/scores.client";
import { StudentGradesPanel } from "./student-grades-panel";

vi.mock("@/features/scores/service/scores.client", () => ({ getStudentScoreSummary: vi.fn() }));
afterEach(() => vi.clearAllMocks());

describe("StudentGradesPanel", () => {
  it("renders real subjects", async () => {
    vi.mocked(getStudentScoreSummary).mockResolvedValue({ student_id: "student-1", school_year: "2026-2027", semester: "1", subjects: [{ subject_id: "math", subject_name: "Toán", oral_scores: [8], fifteen_minute_scores: [9], midterm_score: 8, final_score: 9, average_score: 8.5, teacher_comment: "Tốt" }] });
    renderPanel(true);
    expect(await screen.findByText("Toán")).toBeInTheDocument();
    expect(screen.getByText("8.5")).toBeInTheDocument();
  });

  it("does not fetch without permission", async () => {
    renderPanel(false);
    expect(await screen.findByText("Bạn không có quyền xem điểm số của học sinh này.")).toBeInTheDocument();
    expect(getStudentScoreSummary).not.toHaveBeenCalled();
  });
});

function renderPanel(canRead: boolean) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}><StudentGradesPanel studentId="student-1" canRead={canRead} /></QueryClientProvider>);
}