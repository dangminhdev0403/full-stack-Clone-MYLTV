import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api/schemas";
import { StudentDetailPage } from "./student-detail-page";
import { getStudent } from "../service/students.client";

vi.mock("next-auth/react", () => ({ useSession: () => ({ data: { user: { role: "super_admin", permissions: [] } }, status: "authenticated" }) }));

vi.mock("@/features/admin-shell", () => ({
  AdminShell: ({ children, title }: { children: React.ReactNode; title: string }) => <main><h1>{title}</h1>{children}</main>,
  Icon: ({ name }: { name: string }) => <span>{name}</span>,
}));
vi.mock("../service/students.client", () => ({ getStudent: vi.fn() }));

const getStudentMock = vi.mocked(getStudent);
afterEach(() => vi.clearAllMocks());

describe("StudentDetailPage", () => {
  it("shows an accessible profile loading state", () => {
    getStudentMock.mockReturnValue(new Promise(() => undefined));
    renderPage();
    expect(screen.getByRole("status", { name: "Đang tải hồ sơ học sinh" })).toBeInTheDocument();
  });

  it("renders only live Student API profile fields and timestamps", async () => {
    getStudentMock.mockResolvedValue(student());
    renderPage();

    expect(await screen.findByRole("heading", { level: 1, name: "Nguyễn Minh Anh" })).toBeInTheDocument();
    expect(screen.getAllByText("HS001")).not.toHaveLength(0);
    expect(screen.getAllByText("10A1")).not.toHaveLength(0);
    expect(screen.getAllByText("Lương Thế Vinh")).not.toHaveLength(0);
    expect(screen.getAllByText("Đang học")).not.toHaveLength(0);
    expect(screen.getByText(/16 thg 7, 2026/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Thông tin phụ huynh/ })).toBeInTheDocument();
    expect(screen.getByText(/Chuyên cần · Đang hoàn thiện/)).toBeInTheDocument();
    expect(screen.queryByText(/Xuất học bạ PDF/i)).not.toBeInTheDocument();
  });

  it("renders permission-specific failure and supports retry", async () => {
    const user = userEvent.setup();
    getStudentMock
      .mockRejectedValueOnce(new ApiClientError("FORBIDDEN", "Forbidden", undefined, "req-2", 403))
      .mockResolvedValueOnce(student());
    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("Bạn không có quyền xem hồ sơ học sinh");
    await user.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findAllByText("HS001")).not.toHaveLength(0);
    expect(getStudentMock).toHaveBeenCalledTimes(2);
  });
});

function student() {
  return {
    id: "student-1", code: "HS001", full_name: "Nguyễn Minh Anh", avatar_url: null,
    grade: "10", class_name: "10A1", school_name: "Lương Thế Vinh", is_active: true,
    created_at: "2026-07-15T00:00:00.000Z", updated_at: "2026-07-16T00:00:00.000Z",
  };
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}><StudentDetailPage id="student-1" /></QueryClientProvider>);
}
