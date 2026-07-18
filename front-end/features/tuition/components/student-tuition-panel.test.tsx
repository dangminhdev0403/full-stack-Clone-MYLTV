import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api/schemas";
import { listTuitionCharges } from "../service/tuition.client";
import { StudentTuitionPanel } from "./student-tuition-panel";

vi.mock("../service/tuition.client", () => ({ listTuitionCharges: vi.fn() }));
const listMock = vi.mocked(listTuitionCharges);
afterEach(() => vi.clearAllMocks());

describe("StudentTuitionPanel", () => {
  it("does not call the API without read permission", () => {
    renderPanel(false);
    expect(
      screen.getByText(
        "Bạn không có quyền xem dữ liệu học phí của học sinh này.",
      ),
    ).toBeInTheDocument();
    expect(listMock).not.toHaveBeenCalled();
  });

  it("renders backend summary and student-scoped charges", async () => {
    listMock.mockResolvedValue({
      items: [
        {
          id: "charge-1",
          student_id: "student-1",
          student_code: "HS001",
          student_name: "Nguyễn Minh Anh",
          grade: "10",
          class_name: "10A1",
          semester_id: "semester-1",
          semester_name: "Học kỳ I",
          academic_year_id: "year-1",
          academic_year_name: "2026-2027",
          title: "Học phí tháng 9",
          amount_due: 5_000_000,
          amount_paid: 2_000_000,
          amount_outstanding: 3_000_000,
          status: "partial",
          due_date: "2026-09-15",
          note: null,
          is_waived: false,
          created_at: "2026-07-18T00:00:00.000Z",
          updated_at: "2026-07-18T00:00:00.000Z",
        },
      ],
      page: 1,
      page_size: 100,
      total: 1,
      has_next: false,
      summary: {
        amount_due: 5_000_000,
        amount_paid: 2_000_000,
        amount_outstanding: 3_000_000,
      },
    });
    renderPanel(true);
    expect(await screen.findByText("Học phí tháng 9")).toBeInTheDocument();
    expect(screen.getAllByText("3.000.000 ₫")).toHaveLength(2);
    expect(listMock).toHaveBeenCalledWith(
      "?student_id=student-1&page=1&page_size=100",
    );
  });

  it("shows a retry state for a real API error", async () => {
    const user = userEvent.setup();
    listMock
      .mockRejectedValueOnce(
        new ApiClientError(
          "UPSTREAM_ERROR",
          "Failed",
          undefined,
          undefined,
          500,
        ),
      )
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        page_size: 100,
        total: 0,
        has_next: false,
        summary: { amount_due: 0, amount_paid: 0, amount_outstanding: 0 },
      });
    renderPanel(true);
    expect(
      await screen.findByText("Dịch vụ học phí hiện không khả dụng."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(
      await screen.findByText("Học sinh chưa có khoản học phí nào."),
    ).toBeInTheDocument();
    expect(listMock).toHaveBeenCalledTimes(2);
  });
});

function renderPanel(canRead: boolean) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <StudentTuitionPanel studentId="student-1" canRead={canRead} />
    </QueryClientProvider>,
  );
}
