import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api/schemas";
import { StudentDetailPage } from "./student-detail-page";
import { getStudent, updateStudent } from "../service/students.client";
import { listTuitionCharges } from "@/features/tuition/service/tuition.client";
import { getStudentAttendance } from "@/features/attendance/service/attendance.client";
import { getStudentScoreSummary } from "@/features/scores/service/scores.client";
import { getStudentBusRoute } from "../service/student-transport.client";

const sessionUser = {
  role: "admin",
  permissions: ["students.read", "students.manage", "billing.tuition.read", "academics.attendance.read", "academics.scores.read", "student_services.bus.read"],
};
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: sessionUser }, status: "authenticated" }),
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
vi.mock("../service/students.client", () => ({
  getStudent: vi.fn(),
  updateStudent: vi.fn(),
}));
vi.mock("@/features/tuition/service/tuition.client", () => ({
  listTuitionCharges: vi.fn(),
}));
vi.mock("@/features/attendance/service/attendance.client", () => ({
  getStudentAttendance: vi.fn(),
}));
vi.mock("@/features/scores/service/scores.client", () => ({ getStudentScoreSummary: vi.fn() }));
vi.mock("../service/student-transport.client", () => ({ getStudentBusRoute: vi.fn() }));

const getStudentMock = vi.mocked(getStudent);
const updateStudentMock = vi.mocked(updateStudent);
const listTuitionMock = vi.mocked(listTuitionCharges);
const getAttendanceMock = vi.mocked(getStudentAttendance);
const getScoresMock = vi.mocked(getStudentScoreSummary);
const getBusMock = vi.mocked(getStudentBusRoute);

beforeEach(() => {
  window.history.replaceState({}, "", "/admin/students/student-1");
  sessionUser.role = "admin";
  sessionUser.permissions = [
    "students.read",
    "students.manage",
    "billing.tuition.read",
    "academics.attendance.read",
    "academics.scores.read",
    "student_services.bus.read",
  ];
  getStudentMock.mockResolvedValue(student());
  updateStudentMock.mockResolvedValue(student());
  listTuitionMock.mockResolvedValue({
    items: [],
    page: 1,
    page_size: 100,
    total: 0,
    has_next: false,
    summary: { amount_due: 0, amount_paid: 0, amount_outstanding: 0 },
  });
  getAttendanceMock.mockResolvedValue({
    student_id: "student-1",
    history: [{ date: "2026-07-18", period: "morning", status: "late", check_in_at: "07:02", check_out_at: "11:30", note: "Đến muộn 5 phút" }],
  });
  getScoresMock.mockResolvedValue({ student_id: "student-1", school_year: "2026-2027", semester: "1", subjects: [{ subject_id: "math", subject_name: "Toán", oral_scores: [8], fifteen_minute_scores: [9], midterm_score: 8, final_score: 9, average_score: 8.5, teacher_comment: "Tốt" }] });
  getBusMock.mockResolvedValue({ route_id: "route-1", route_name: "Tuyến 01", pickup_point: "Cổng trường", dropoff_point: "Nhà", pickup_time: "06:30", dropoff_time: "17:00", driver_name: "Tài xế UAT", driver_phone: null, bus_plate: "29B-UAT" });
});
afterEach(() => vi.clearAllMocks());

describe("StudentDetailPage", () => {
  it("shows an accessible profile loading state", () => {
    getStudentMock.mockReturnValue(new Promise(() => undefined));
    renderPage();
    expect(
      screen.getByRole("status", { name: "Đang tải hồ sơ học sinh" }),
    ).toBeInTheDocument();
  });

  it("renders the reference-aligned personal and guardian information from the Student API", async () => {
    renderPage();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Nguyễn Minh Anh" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Thông tin cá nhân", selected: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Lý lịch cá nhân" }),
    ).toBeInTheDocument();
    expect(screen.getByText("16/06/2011")).toBeInTheDocument();
    expect(screen.getByText("Hà Nội")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Thông tin phụ huynh" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Vũ Văn Nam")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "0904 123 456" })).toHaveAttribute(
      "href",
      "tel:0904123456",
    );
    expect(screen.getByText(/Liên hệ khẩn cấp/i)).toBeInTheDocument();
    expect(listTuitionMock).not.toHaveBeenCalled();
  });

  it("lazy-loads real attendance only after its tab is selected", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Vũ Văn Nam");
    expect(getAttendanceMock).not.toHaveBeenCalled();
    await user.click(screen.getByRole("tab", { name: "Chuyên cần" }));
    expect(await screen.findByText("Đi muộn")).toBeInTheDocument();
    expect(getAttendanceMock).toHaveBeenCalledWith("student-1");
    expect(window.location.search).toBe("?tab=attendance");
  });

  it("lazy-loads tuition only after its tab is selected and keeps URL state", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Vũ Văn Nam");
    expect(listTuitionMock).not.toHaveBeenCalled();
    await user.click(screen.getByRole("tab", { name: "Học phí" }));
    await waitFor(() =>
      expect(listTuitionMock).toHaveBeenCalledWith(
        "?student_id=student-1&page=1&page_size=100",
      ),
    );
    expect(window.location.search).toBe("?tab=tuition");
    expect(
      screen.getByRole("tab", { name: "Học phí", selected: true }),
    ).toBeInTheDocument();
  });

  it("does not request tuition without billing.tuition.read", async () => {
    sessionUser.permissions = ["students.read"];
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Vũ Văn Nam");
    await user.click(screen.getByRole("tab", { name: "Học phí" }));
    expect(
      await screen.findByText(
        "Bạn không có quyền xem dữ liệu học phí của học sinh này.",
      ),
    ).toBeInTheDocument();
    expect(listTuitionMock).not.toHaveBeenCalled();
  });

  it("supports arrow-key tab navigation", async () => {
    const user = userEvent.setup();
    renderPage();
    const profile = await screen.findByRole("tab", {
      name: "Thông tin cá nhân",
    });
    profile.focus();
    await user.keyboard("{ArrowRight}");
    expect(
      screen.getByRole("tab", { name: "Chuyên cần", selected: true }),
    ).toHaveFocus();
    expect(await screen.findByText("Đi muộn")).toBeInTheDocument();
    expect(listTuitionMock).not.toHaveBeenCalled();

    await user.keyboard("{End}");
    expect(
      screen.getByRole("tab", { name: "Xe tuyến", selected: true }),
    ).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(
      screen.getByRole("tab", { name: "Học phí", selected: true }),
    ).toHaveFocus();
    await user.keyboard("{Home}");
    expect(
      screen.getByRole("tab", { name: "Thông tin cá nhân", selected: true }),
    ).toHaveFocus();
    expect(window.location.search).toBe("");
  });

  it("restores a direct tab URL and follows browser navigation", async () => {
    window.history.replaceState({}, "", "/admin/students/student-1?tab=grades");
    renderPage();
    expect(
      await screen.findByRole("tab", { name: "Điểm số", selected: true }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Toán")).toBeInTheDocument();

    act(() => {
      window.history.pushState(
        {},
        "",
        "/admin/students/student-1?tab=transport",
      );
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(
      screen.getByRole("tab", { name: "Xe tuyến", selected: true }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Tuyến 01")).toBeInTheDocument();
    expect(listTuitionMock).not.toHaveBeenCalled();
  });

  it("renders permission-specific profile failure and supports retry", async () => {
    const user = userEvent.setup();
    getStudentMock
      .mockRejectedValueOnce(
        new ApiClientError("FORBIDDEN", "Forbidden", undefined, "req-2", 403),
      )
      .mockResolvedValueOnce(student());
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Bạn không có quyền xem hồ sơ học sinh",
    );
    await user.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByText("Vũ Văn Nam")).toBeInTheDocument();
  });
});

function student() {
  return {
    id: "student-1",
    code: "HS001",
    full_name: "Nguyễn Minh Anh",
    avatar_url: null,
    grade: "10",
    class_name: "10A1",
    school_name: "Sổ Liên Lạc Điện Tử",
    is_active: true,
    date_of_birth: "2011-06-16",
    gender: "male" as const,
    ethnicity: "Kinh",
    birth_place: "Hà Nội",
    permanent_address:
      "Số 24, Ngõ 121 Thái Hà, Phường Trung Liệt, Đống Đa, Hà Nội",
    cohort_start_year: 2025,
    cohort_end_year: 2028,
    guardian_contacts: [
      {
        id: "g-1",
        relationship: "father" as const,
        relationship_label: null,
        full_name: "Vũ Văn Nam",
        phone: "0904 123 456",
        is_emergency_contact: false,
      },
      {
        id: "g-2",
        relationship: "grandfather" as const,
        relationship_label: null,
        full_name: "Vũ Văn Hùng",
        phone: "0912 345 678",
        is_emergency_contact: true,
      },
    ],
    created_at: "2026-07-15T00:00:00.000Z",
    updated_at: "2026-07-16T00:00:00.000Z",
  };
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <StudentDetailPage id="student-1" />
    </QueryClientProvider>,
  );
}
