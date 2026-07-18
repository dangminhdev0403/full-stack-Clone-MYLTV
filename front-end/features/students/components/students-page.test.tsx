import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api/schemas";
import { StudentsPage } from "./students-page";
import { listStudents } from "../service/students.client";

vi.mock("next-auth/react", () => ({ useSession: () => ({ data: { user: { role: "super_admin", permissions: [] } }, status: "authenticated" }) }));

vi.mock("@/features/admin-shell", () => ({
  AdminShell: ({ children, title }: { children: React.ReactNode; title: string }) => <main><h1>{title}</h1>{children}</main>,
  Icon: ({ name }: { name: string }) => <span>{name}</span>,
}));
vi.mock("../service/students.client", () => ({ listStudents: vi.fn() }));

const listStudentsMock = vi.mocked(listStudents);

afterEach(() => vi.clearAllMocks());

describe("StudentsPage", () => {
  it("renders live student fields in the management table without unsupported content", async () => {
    listStudentsMock.mockResolvedValue({ items: [student()], page: 1, page_size: 20, total: 1, has_next: false });

    renderPage();

    expect(await screen.findByRole("link", { name: /Xem hồ sơ Nguyễn Minh Anh/ })).toHaveAttribute("href", "/admin/students/student-1");
    expect(screen.getByRole("cell", { name: "HS001" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "10A1" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Đang học" })).toBeInTheDocument();
    expect(screen.queryByText(/phụ huynh|số điện thoại|điểm|học phí|xe tuyến/i)).not.toBeInTheDocument();
  });

  it("sends search, grade, class and active filters to the list API", async () => {
    const user = userEvent.setup();
    listStudentsMock.mockResolvedValue({ items: [student()], page: 1, page_size: 20, total: 1, has_next: false });
    renderPage();
    await screen.findByText("HS001");

    await user.type(screen.getByRole("searchbox", { name: "Tìm kiếm học sinh" }), "Minh Anh");
    await user.selectOptions(screen.getByLabelText("Lọc theo khối"), "10");
    await user.type(screen.getByLabelText("Lọc theo lớp"), "10A1");
    await user.selectOptions(screen.getByLabelText("Lọc theo trạng thái"), "true");
    await user.click(screen.getByRole("button", { name: "Áp dụng bộ lọc" }));

    expect(listStudentsMock).toHaveBeenLastCalledWith("?q=Minh+Anh&grade=10&class_name=10A1&is_active=true&page=1&page_size=20");
  });

  it("uses API pagination and disables unavailable directions", async () => {
    const user = userEvent.setup();
    listStudentsMock
      .mockResolvedValueOnce({ items: [student()], page: 1, page_size: 20, total: 21, has_next: true })
      .mockResolvedValueOnce({ items: [student({ id: "student-2", code: "HS021" })], page: 2, page_size: 20, total: 21, has_next: false });
    renderPage();

    const previous = await screen.findByRole("button", { name: "Trang trước" });
    expect(previous).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Trang sau" }));

    expect(listStudentsMock).toHaveBeenLastCalledWith("?page=2&page_size=20");
    expect(await screen.findByText("HS021")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trang sau" })).toBeDisabled();
  });

  it("renders a permission-specific forbidden state", async () => {
    listStudentsMock.mockRejectedValue(new ApiClientError("FORBIDDEN", "Forbidden", undefined, "req-1", 403));
    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("Bạn không có quyền xem danh sách học sinh");
  });

  it("shows an accessible empty state after a successful empty response", async () => {
    listStudentsMock.mockResolvedValue({ items: [], page: 1, page_size: 20, total: 0, has_next: false });

    renderPage();

    expect(screen.getByRole("status", { name: "Đang tải danh sách học sinh" })).toBeInTheDocument();
    expect(await screen.findByRole("status", { name: "Danh sách học sinh trống" })).toHaveTextContent("Chưa có học sinh");
  });
});

function student(overrides: Record<string, unknown> = {}) {
  return {
    id: "student-1", code: "HS001", full_name: "Nguyễn Minh Anh", avatar_url: null,
    grade: "10", class_name: "10A1", school_name: "Lương Thế Vinh", is_active: true,
    created_at: "2026-07-15T00:00:00.000Z", updated_at: "2026-07-16T00:00:00.000Z", ...overrides,
  };
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}><StudentsPage /></QueryClientProvider>);
}
