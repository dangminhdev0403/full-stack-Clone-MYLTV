import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AcademicStructureManager } from "./academic-structure-manager";
import {
  createAcademicYear,
  getCurrentAcademicContext,
  listAcademicYears,
  listSemesters,
  setSemesterCurrent,
} from "../service/academic-structure.client";

vi.mock("next-auth/react", () => ({ useSession: vi.fn() }));
vi.mock("@/features/admin-shell", () => ({
  AdminShell: ({ children, title }: { children: React.ReactNode; title: string }) => <main><h1>{title}</h1>{children}</main>,
  Icon: ({ name }: { name: string }) => <span aria-hidden="true" data-testid={`icon-${name}`}>{name}</span>,
}));
vi.mock("../service/academic-structure.client", () => ({
  createAcademicYear: vi.fn(),
  createSemester: vi.fn(),
  getCurrentAcademicContext: vi.fn(),
  listAcademicYears: vi.fn(),
  listSemesters: vi.fn(),
  setAcademicYearCurrent: vi.fn(),
  setSemesterCurrent: vi.fn(),
  updateAcademicYear: vi.fn(),
  updateSemester: vi.fn(),
}));

const useSessionMock = vi.mocked(useSession);
const getCurrentAcademicContextMock = vi.mocked(getCurrentAcademicContext);
const listAcademicYearsMock = vi.mocked(listAcademicYears);
const listSemestersMock = vi.mocked(listSemesters);
const createAcademicYearMock = vi.mocked(createAcademicYear);
const setSemesterCurrentMock = vi.mocked(setSemesterCurrent);

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AcademicStructureManager />
    </QueryClientProvider>
  );
}

function session(permissions: string[], role = "admin") {
  return {
    data: {
      user: { id: "user-1", name: "Admin", permissions, role },
      expires: "2026-01-01",
    },
    status: "authenticated" as const,
    update: vi.fn(),
  };
}

afterEach(() => vi.clearAllMocks());

describe("AcademicStructureManager", () => {
  it("displays permission denied alert if user lacks academics.context.read", () => {
    useSessionMock.mockReturnValue(session([]));
    renderComponent();
    expect(screen.getByText("Không có quyền truy cập")).toBeInTheDocument();
    expect(screen.getByText(/Tài khoản của bạn không có quyền xem cấu hình/)).toBeInTheDocument();
  });

  it("renders academic context summary and years list for authorized reader", async () => {
    useSessionMock.mockReturnValue(session(["academics.context.read"]));
    getCurrentAcademicContextMock.mockResolvedValue({
      academic_year: { id: "2024-2025", code: "2024-2025", display_name: "Năm học 2024-2025", starts_on: "2024-09-01", ends_on: "2025-05-31", is_current: true },
      semester: { id: "2024-2025-sem1", academic_year_id: "2024-2025", code: "HK1", display_name: "Học kỳ I", starts_on: "2024-09-01", ends_on: "2025-01-15", sort_order: 1, is_current: true },
    });
    listAcademicYearsMock.mockResolvedValue([
      { id: "2024-2025", code: "2024-2025", display_name: "Năm học 2024-2025", starts_on: "2024-09-01", ends_on: "2025-05-31", is_current: true },
    ]);
    listSemestersMock.mockResolvedValue([]);

    renderComponent();

    const matches = await screen.findAllByText("Năm học 2024-2025");
    expect(matches.length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Thêm năm học" })).not.toBeInTheDocument();
  });

  it("allows creating academic year and setting current semester for manager", async () => {
    useSessionMock.mockReturnValue(session(["academics.context.read", "academics.context.manage"]));
    getCurrentAcademicContextMock.mockResolvedValue({ academic_year: null, semester: null });
    listAcademicYearsMock.mockResolvedValue([
      { id: "2024-2025", code: "2024-2025", display_name: "Năm học 2024-2025", starts_on: "2024-09-01", ends_on: "2025-05-31", is_current: true },
    ]);
    listSemestersMock.mockResolvedValue([
      { id: "2024-2025-sem2", academic_year_id: "2024-2025", code: "HK2", display_name: "Học kỳ II", starts_on: "2025-01-16", ends_on: "2025-05-31", sort_order: 2, is_current: false },
    ]);
    createAcademicYearMock.mockResolvedValue({
      id: "2025-2026", code: "2025-2026", display_name: "Năm học 2025-2026", starts_on: "2025-09-01", ends_on: "2026-05-31", is_current: false,
    });
    setSemesterCurrentMock.mockResolvedValue({
      id: "2024-2025-sem2", academic_year_id: "2024-2025", code: "HK2", display_name: "Học kỳ II", starts_on: "2025-01-16", ends_on: "2025-05-31", sort_order: 2, is_current: true,
    });

    renderComponent();

    const initialMatches = await screen.findAllByText("Năm học 2024-2025");
    expect(initialMatches.length).toBeGreaterThan(0);

    const addBtn = screen.getAllByRole("button", { name: "Thêm năm học" })[0];
    fireEvent.click(addBtn);

    const idInput = screen.getByLabelText("Mã định danh (ID năm học)");
    const codeInput = screen.getByLabelText("Mã năm học (Code)");
    const nameInput = screen.getByLabelText("Tên hiển thị");

    fireEvent.change(idInput, { target: { value: "2025-2026" } });
    fireEvent.change(codeInput, { target: { value: "2025-2026" } });
    fireEvent.change(nameInput, { target: { value: "Năm học 2025-2026" } });

    const submitBtn = screen.getByRole("button", { name: "Lưu thông tin năm học" });
    const form = submitBtn.closest("form")!;
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(createAcademicYearMock).toHaveBeenCalledWith({
        id: "2025-2026",
        code: "2025-2026",
        display_name: "Năm học 2025-2026",
        starts_on: expect.any(String),
        ends_on: expect.any(String),
      });
    });

    // Wait for creation success banner
    expect(await screen.findByText("Tạo năm học mới thành công.")).toBeInTheDocument();

    // Switch to Semesters tab
    const semTab = screen.getByRole("button", { name: "Xem danh sách học kỳ" });
    fireEvent.click(semTab);

    expect(await screen.findByText("Học kỳ II")).toBeInTheDocument();

    const setSemCurrentBtn = screen.getByRole("button", { name: "Đặt Học kỳ II làm học kỳ hiện tại" });
    await act(async () => {
      fireEvent.click(setSemCurrentBtn);
    });

    await waitFor(() => {
      expect(setSemesterCurrentMock).toHaveBeenCalledWith("2024-2025-sem2");
    });
  });

  it("displays inline Vietnamese mutation error on creation failure", async () => {
    useSessionMock.mockReturnValue(session(["academics.context.read", "academics.context.manage"]));
    getCurrentAcademicContextMock.mockResolvedValue({ academic_year: null, semester: null });
    listAcademicYearsMock.mockResolvedValue([]);
    createAcademicYearMock.mockRejectedValue(new Error("Academic year with this ID or code already exists"));

    renderComponent();

    const addBtn = await screen.findByRole("button", { name: "Thêm năm học" });
    fireEvent.click(addBtn);

    const idInput = screen.getByLabelText("Mã định danh (ID năm học)");
    const codeInput = screen.getByLabelText("Mã năm học (Code)");
    const nameInput = screen.getByLabelText("Tên hiển thị");

    fireEvent.change(idInput, { target: { value: "2024-2025" } });
    fireEvent.change(codeInput, { target: { value: "2024-2025" } });
    fireEvent.change(nameInput, { target: { value: "Năm học 2024-2025" } });

    const submitBtn = screen.getByRole("button", { name: "Lưu thông tin năm học" });
    const form = submitBtn.closest("form")!;
    await act(async () => {
      fireEvent.submit(form);
    });

    const errorElements = await screen.findAllByText(/Mã hoặc ID đã tồn tại trong hệ thống/);
    expect(errorElements.length).toBeGreaterThan(0);
  });
});
