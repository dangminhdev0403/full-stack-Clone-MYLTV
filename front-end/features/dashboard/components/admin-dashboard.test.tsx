import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminDashboard } from "./admin-dashboard";
import { listAttendanceSessions } from "@/features/attendance/service/attendance.client";
import { listFeedback } from "@/features/feedback/service/feedback.client";
import { listNews } from "@/features/news/service/news.client";
import { listNotifications } from "@/features/notifications/service/notifications.client";
import { listStudents } from "@/features/students/service/students.client";
import { listTuitionCharges } from "@/features/tuition/service/tuition.client";
import { listUsers } from "@/features/users/service/users.client";

vi.mock("@/features/admin-shell", () => ({
  Icon: ({ name }: { name: string }) => <span aria-hidden="true">{name}</span>,
  AdminShell: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}));

vi.mock("@/features/students/service/students.client", () => ({ listStudents: vi.fn() }));
vi.mock("@/features/users/service/users.client", () => ({ listUsers: vi.fn() }));
vi.mock("@/features/attendance/service/attendance.client", () => ({ listAttendanceSessions: vi.fn() }));
vi.mock("@/features/tuition/service/tuition.client", () => ({ listTuitionCharges: vi.fn() }));
vi.mock("@/features/news/service/news.client", () => ({ listNews: vi.fn() }));
vi.mock("@/features/notifications/service/notifications.client", () => ({ listNotifications: vi.fn() }));
vi.mock("@/features/feedback/service/feedback.client", () => ({ listFeedback: vi.fn() }));

const listStudentsMock = vi.mocked(listStudents);
const listUsersMock = vi.mocked(listUsers);
const listAttendanceMock = vi.mocked(listAttendanceSessions);
const listTuitionMock = vi.mocked(listTuitionCharges);
const listNewsMock = vi.mocked(listNews);
const listNotificationsMock = vi.mocked(listNotifications);
const listFeedbackMock = vi.mocked(listFeedback);

afterEach(() => vi.clearAllMocks());

describe("AdminDashboard", () => {
  it("renders real totals returned by the implemented metric APIs", async () => {
    listUsersMock.mockResolvedValue({ items: [], page: 1, page_size: 1, total: 7 });
    listStudentsMock.mockResolvedValue({ items: [], page: 1, page_size: 1, total: 125, has_next: true });
    listAttendanceMock.mockResolvedValue({ items: [], page: 1, page_size: 1, total: 42 });
    listTuitionMock.mockResolvedValue({ items: [], page: 1, page_size: 1, total: 18 });
    listNewsMock.mockResolvedValue({
      items: [{
        id: "news-1",
        title: "Thông báo năm học mới",
        summary: "Lịch tựu trường đã cập nhật",
        content: "Nội dung",
        image_url: null,
        category: "school",
        is_pinned: false,
        sort_order: 0,
        published_at: "2026-07-26T08:00:00.000Z",
        status: "published",
        audiences: [{ type: "all", value: null }],
        created_at: "2026-07-26T08:00:00.000Z",
        updated_at: "2026-07-26T08:00:00.000Z",
      }],
      page: 1,
      page_size: 3,
      total: 10,
      has_next: true,
    });
    listNotificationsMock.mockResolvedValue({ items: [], page: 1, page_size: 1, total: 15 });
    listFeedbackMock.mockResolvedValue([]);

    renderDashboard();

    expect(await screen.findByText("7")).toBeInTheDocument();
    expect(screen.getByText("125")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("Thông báo năm học mới")).toBeInTheDocument();
  });

  it("keeps the students total available when the users request fails", async () => {
    listUsersMock.mockRejectedValue(new Error("users unavailable"));
    listStudentsMock.mockResolvedValue({ items: [], page: 1, page_size: 1, total: 125, has_next: false });
    listAttendanceMock.mockResolvedValue({ items: [], page: 1, page_size: 1, total: 42 });
    listTuitionMock.mockResolvedValue({ items: [], page: 1, page_size: 1, total: 18 });
    listNewsMock.mockResolvedValue({ items: [], page: 1, page_size: 1, total: 10 });
    listNotificationsMock.mockResolvedValue({ items: [], page: 1, page_size: 1, total: 15 });
    listFeedbackMock.mockResolvedValue([]);

    renderDashboard();

    expect(await screen.findByText("125")).toBeInTheDocument();
    expect(screen.getByText("Không thể tải số người dùng.")).toBeInTheDocument();
  });
});

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminDashboard />
    </QueryClientProvider>,
  );
}
