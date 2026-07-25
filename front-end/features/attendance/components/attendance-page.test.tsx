import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AttendancePage } from "./attendance-page";
import {
  createAttendanceSession,
  listAttendanceSessions,
  updateAttendanceSession,
} from "../service/attendance.client";
import { listStudents } from "@/features/students/service/students.client";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        role: "super_admin",
        permissions: ["academics.attendance.manage"],
      },
    },
  }),
}));
vi.mock("@/features/admin-shell", () => ({
  AdminShell: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
  Icon: ({ name }: { name: string }) => <span aria-hidden="true">{name}</span>,
}));
vi.mock("../service/attendance.client", () => ({
  createAttendanceSession: vi.fn(),
  listAttendanceSessions: vi.fn(),
  updateAttendanceSession: vi.fn(),
}));
vi.mock("@/features/students/service/students.client", () => ({
  listStudents: vi.fn(),
}));
const listMock = vi.mocked(listAttendanceSessions);
const createMock = vi.mocked(createAttendanceSession);
const updateMock = vi.mocked(updateAttendanceSession);
const studentsMock = vi.mocked(listStudents);
afterEach(() => vi.clearAllMocks());

describe("AttendancePage", () => {
  it("renders live counts and student statuses without invented attendance rates", async () => {
    listMock.mockResolvedValue(listData());
    renderPage();
    expect(await screen.findByText("Nguyễn Minh Anh")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Điểm danh" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Minh Anh")).toBeInTheDocument();
    expect(screen.getByText(/UAT-HS-001/)).toBeInTheDocument();
    expect(screen.getByText("Có mặt: 1")).toBeInTheDocument();
    expect(screen.queryByText(/\d+%/i)).not.toBeInTheDocument();
  });

  it("filters by date and class", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValue(listData());
    renderPage();
    await screen.findByText("Nguyễn Minh Anh");
    await user.clear(screen.getByLabelText("Ngày điểm danh"));
    await user.type(screen.getByLabelText("Ngày điểm danh"), "2026-07-19");
    await user.clear(screen.getByLabelText("Lớp"));
    await user.type(screen.getByLabelText("Lớp"), "6A2");
    await user.click(screen.getByRole("button", { name: "Lọc điểm danh" }));
    expect(listMock).toHaveBeenLastCalledWith(
      "?date=2026-07-19&class_name=6A2&period=morning&page=1&page_size=20",
    );
  });

  it("updates explicit status and note then announces success", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValue(listData());
    updateMock.mockResolvedValue(listData().items[0]);
    renderPage();
    await user.selectOptions(
      await screen.findByLabelText("Trạng thái Nguyễn Minh Anh"),
      "excused",
    );
    await user.type(
      screen.getByLabelText("Ghi chú Nguyễn Minh Anh"),
      "Có đơn xin phép",
    );
    await user.click(screen.getByRole("button", { name: "Lưu điểm danh" }));
    expect(updateMock).toHaveBeenCalledWith("session-1", {
      records: [
        expect.objectContaining({
          student_id: "student-1",
          status: "excused",
          note: "Có đơn xin phép",
        }),
      ],
    });
    expect(await screen.findByText("Đã lưu điểm danh.")).toBeInTheDocument();
  });

  it("creates a new session from active students when the selected class is empty", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValue({
      items: [],
      page: 1,
      page_size: 20,
      total: 0,
      has_next: false,
    });
    studentsMock.mockResolvedValue({
      items: [
        {
          id: "student-1",
          code: "UAT-HS-001",
          full_name: "Nguyễn Minh Anh",
          avatar_url: null,
          grade: "6",
          class_name: "6A1",
          school_name: "Sổ Liên Lạc Điện Tử",
          is_active: true,
          created_at: "2026-07-18T00:00:00.000Z",
          updated_at: "2026-07-18T00:00:00.000Z",
        },
      ],
      page: 1,
      page_size: 100,
      total: 1,
      has_next: false,
    });
    createMock.mockResolvedValue(listData().items[0]);
    renderPage();
    await user.type(screen.getByLabelText("Ngày điểm danh"), "2026-07-18");
    await user.type(screen.getByLabelText("Lớp"), "6A1");
    await user.selectOptions(screen.getByLabelText("Buổi học"), "afternoon");
    await user.click(screen.getByRole("button", { name: "Lọc điểm danh" }));
    await user.click(
      screen.getByRole("button", { name: "Tạo buổi điểm danh" }),
    );
    expect(studentsMock).toHaveBeenCalledWith(
      "?class_name=6A1&is_active=true&page=1&page_size=100",
    );
    expect(createMock).toHaveBeenCalledWith({
      date: "2026-07-18",
      class_name: "6A1",
      period: "afternoon",
      records: [{ student_id: "student-1", status: "present", note: null }],
    });
  });
});

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AttendancePage />
    </QueryClientProvider>,
  );
}
function listData() {
  return {
    items: [
      {
        id: "session-1",
        date: "2026-07-18",
        period: "morning" as const,
        class_name: "6A1",
        semester_id: "semester-1",
        counts: { present: 1, absent: 0, late: 0, excused: 0 },
        records: [
          {
            id: "record-1",
            student_id: "student-1",
            student_code: "UAT-HS-001",
            student_name: "Nguyễn Minh Anh",
            avatar_url: null,
            grade: "6",
            class_name: "6A1",
            status: "present" as const,
            note: null,
          },
        ],
      },
    ],
    page: 1,
    page_size: 20,
    total: 1,
    has_next: false,
  };
}
