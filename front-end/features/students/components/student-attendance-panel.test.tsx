import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getStudentAttendance } from "@/features/attendance/service/attendance.client";
import { StudentAttendancePanel } from "./student-attendance-panel";

vi.mock("@/features/attendance/service/attendance.client", () => ({
  getStudentAttendance: vi.fn(),
}));

afterEach(() => vi.clearAllMocks());

describe("StudentAttendancePanel", () => {
  it("renders real student attendance history", async () => {
    vi.mocked(getStudentAttendance).mockResolvedValue({
      student_id: "student-1",
      history: [
        {
          date: "2026-07-18",
          period: "morning",
          status: "late",
          check_in_at: "07:02",
          check_out_at: "11:30",
          note: "Đến muộn 5 phút",
        },
      ],
    });

    renderPanel(true);

    expect(await screen.findByText("Đi muộn")).toBeInTheDocument();
    expect(screen.getByText("Đến muộn 5 phút")).toBeInTheDocument();
  });

  it("does not fetch and explains missing permission", async () => {
    renderPanel(false);

    expect(
      await screen.findByText("Bạn không có quyền xem dữ liệu chuyên cần của học sinh này."),
    ).toBeInTheDocument();
    expect(getStudentAttendance).not.toHaveBeenCalled();
  });
});

function renderPanel(canRead: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <StudentAttendancePanel studentId="student-1" canRead={canRead} />
    </QueryClientProvider>,
  );
}