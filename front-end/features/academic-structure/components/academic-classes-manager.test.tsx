// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AcademicClassesManager } from "./academic-classes-manager";
import {
  assignStudentEnrollment,
  createGradeLevel,
  createSchoolClass,
  getClassRoster,
  listAcademicYears,
  listClasses,
  listGradeLevels,
} from "../service/academic-structure.client";

vi.mock("next-auth/react", () => ({ useSession: vi.fn() }));
vi.mock("@/features/admin-shell", () => ({
  AdminShell: ({ children, title }: { children: React.ReactNode; title: string }) => <main><h1>{title}</h1>{children}</main>,
  Icon: ({ name }: { name: string }) => <span aria-hidden="true" data-testid={`icon-${name}`}>{name}</span>,
}));
vi.mock("../service/academic-structure.client", () => ({
  assignStudentEnrollment: vi.fn(),
  createAcademicYear: vi.fn(),
  createGradeLevel: vi.fn(),
  createSchoolClass: vi.fn(),
  createSemester: vi.fn(),
  deactivateStudentEnrollment: vi.fn(),
  getClassRoster: vi.fn(),
  getCurrentAcademicContext: vi.fn(),
  listAcademicYears: vi.fn(),
  listClasses: vi.fn(),
  listGradeLevels: vi.fn(),
  listSemesters: vi.fn(),
  setAcademicYearCurrent: vi.fn(),
  setSemesterCurrent: vi.fn(),
  updateAcademicYear: vi.fn(),
  updateGradeLevel: vi.fn(),
  updateSchoolClass: vi.fn(),
  updateSemester: vi.fn(),
}));

const useSessionMock = vi.mocked(useSession);
const listGradeLevelsMock = vi.mocked(listGradeLevels);
const listClassesMock = vi.mocked(listClasses);
const listAcademicYearsMock = vi.mocked(listAcademicYears);
const createGradeLevelMock = vi.mocked(createGradeLevel);
const createSchoolClassMock = vi.mocked(createSchoolClass);
const getClassRosterMock = vi.mocked(getClassRoster);
const assignStudentEnrollmentMock = vi.mocked(assignStudentEnrollment);

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AcademicClassesManager />
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

describe("AcademicClassesManager", () => {
  it("displays permission denied alert if user lacks academics.structure.read", () => {
    useSessionMock.mockReturnValue(session([]));
    renderComponent();
    expect(screen.getByText("Không có quyền truy cập")).toBeInTheDocument();
    expect(screen.getByText(/Tài khoản của bạn không có quyền xem cấu hình khối lớp và lớp học/)).toBeInTheDocument();
  });

  it("renders grade levels and classes for authorized reader", async () => {
    useSessionMock.mockReturnValue(session(["academics.structure.read"]));
    listGradeLevelsMock.mockResolvedValue([
      { id: "grade-10", code: "G10", display_name: "Khối 10", sort_order: 10 },
    ]);
    listClassesMock.mockResolvedValue([
      {
        id: "class-10a1",
        academic_year_id: "2024-2025",
        grade_level_id: "grade-10",
        code: "10A1",
        display_name: "Lớp 10A1",
        homeroom_teacher_id: null,
        is_active: true,
      },
    ]);
    listAcademicYearsMock.mockResolvedValue([
      { id: "2024-2025", code: "2024-2025", display_name: "Năm học 2024-2025", starts_on: "2024-09-01", ends_on: "2025-05-31", is_current: true },
    ]);

    renderComponent();

    expect(await screen.findByText("Khối 10")).toBeInTheDocument();

    const classTab = screen.getByRole("tab", { name: "Xem danh sách lớp học" });
    fireEvent.click(classTab);

    expect(await screen.findByText("Lớp 10A1")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Thêm lớp học" })).not.toBeInTheDocument();
  });

  it("allows creating grade level and class for manager", async () => {
    useSessionMock.mockReturnValue(session(["academics.structure.read", "academics.structure.manage"]));
    listGradeLevelsMock.mockResolvedValue([
      { id: "grade-10", code: "G10", display_name: "Khối 10", sort_order: 10 },
    ]);
    listClassesMock.mockResolvedValue([]);
    listAcademicYearsMock.mockResolvedValue([
      { id: "2024-2025", code: "2024-2025", display_name: "Năm học 2024-2025", starts_on: "2024-09-01", ends_on: "2025-05-31", is_current: true },
    ]);
    createGradeLevelMock.mockResolvedValue({
      id: "grade-11", code: "G11", display_name: "Khối 11", sort_order: 11,
    });
    createSchoolClassMock.mockResolvedValue({
      id: "class-10a1",
      academic_year_id: "2024-2025",
      grade_level_id: "grade-10",
      code: "10A1",
      display_name: "Lớp 10A1",
      homeroom_teacher_id: null,
      is_active: true,
    });

    renderComponent();

    expect(await screen.findByText("Khối 10")).toBeInTheDocument();

    const addGradeBtn = screen.getByRole("button", { name: "Thêm khối lớp" });
    fireEvent.click(addGradeBtn);

    fireEvent.change(screen.getByLabelText(/Mã khối lớp \(Code\)/), { target: { value: "G11" } });
    fireEvent.change(screen.getByLabelText(/Tên hiển thị khối lớp/), { target: { value: "Khối 11" } });

    const submitGradeBtn = screen.getByRole("button", { name: "Lưu thông tin khối lớp" });
    await act(async () => {
      fireEvent.submit(submitGradeBtn.closest("form")!);
    });

    await waitFor(() => {
      expect(createGradeLevelMock).toHaveBeenCalledWith({
        code: "G11",
        display_name: "Khối 11",
        sort_order: 0,
      });
    });

    expect(await screen.findByText("Tạo khối lớp thành công.")).toBeInTheDocument();

    // Switch to Classes tab
    const classTab = screen.getByRole("tab", { name: "Xem danh sách lớp học" });
    fireEvent.click(classTab);

    const addClassBtn = await screen.findByRole("button", { name: "Thêm lớp học" });
    fireEvent.click(addClassBtn);

    fireEvent.change(screen.getByLabelText(/Mã lớp học \(Code\)/), { target: { value: "10A1" } });
    fireEvent.change(screen.getByLabelText(/Tên lớp học/), { target: { value: "Lớp 10A1" } });

    const submitClassBtn = screen.getByRole("button", { name: "Lưu thông tin lớp học" });
    await act(async () => {
      fireEvent.submit(submitClassBtn.closest("form")!);
    });

    await waitFor(() => {
      expect(createSchoolClassMock).toHaveBeenCalledWith({
        academic_year_id: "2024-2025",
        grade_level_id: "grade-10",
        code: "10A1",
        display_name: "Lớp 10A1",
        homeroom_teacher_id: null,
        is_active: true,
      });
    });

    expect(await screen.findByText("Tạo lớp học mới thành công.")).toBeInTheDocument();
  });

  it("allows selecting class roster and assigning student by ID", async () => {
    useSessionMock.mockReturnValue(session(["academics.structure.read", "academics.structure.manage"]));
    listGradeLevelsMock.mockResolvedValue([
      { id: "grade-10", code: "G10", display_name: "Khối 10", sort_order: 10 },
    ]);
    listClassesMock.mockResolvedValue([
      {
        id: "class-10a1",
        academic_year_id: "2024-2025",
        grade_level_id: "grade-10",
        code: "10A1",
        display_name: "Lớp 10A1",
        homeroom_teacher_id: null,
        is_active: true,
      },
    ]);
    getClassRosterMock.mockResolvedValue({
      class_id: "class-10a1",
      class_name: "Lớp 10A1",
      class_code: "10A1",
      enrollments: [
        {
          id: "enr-1",
          student_id: "std-1",
          class_id: "class-10a1",
          starts_on: "2024-09-01",
          is_active: true,
          student: {
            id: "std-1",
            code: "HS001",
            full_name: "Nguyễn Văn A",
            grade: "G10",
            class_name: "10A1",
            is_active: true,
          },
        },
      ],
    });
    assignStudentEnrollmentMock.mockResolvedValue({
      id: "enr-2",
      student_id: "std-2",
      class_id: "class-10a1",
      starts_on: "2024-09-05",
      is_active: true,
    });

    renderComponent();

    // Switch to Roster tab
    const rosterTab = await screen.findByRole("tab", { name: "Danh sách học sinh lớp" });
    fireEvent.click(rosterTab);

    // Select class
    const selectClass = await screen.findByLabelText("Chọn lớp học");
    fireEvent.change(selectClass, { target: { value: "class-10a1" } });

    expect(await screen.findByText("Nguyễn Văn A")).toBeInTheDocument();

    // Assign student
    const assignBtn = screen.getByRole("button", { name: "Xếp học sinh vào lớp" });
    fireEvent.click(assignBtn);

    fireEvent.change(screen.getByLabelText(/Mã học sinh \(Student ID\)/), { target: { value: "std-2" } });
    fireEvent.change(screen.getByLabelText(/Ngày bắt đầu học/), { target: { value: "2024-09-05" } });

    const submitAssignBtn = screen.getByRole("button", { name: "Xác nhận xếp lớp" });
    await act(async () => {
      fireEvent.submit(submitAssignBtn.closest("form")!);
    });

    await waitFor(() => {
      expect(assignStudentEnrollmentMock).toHaveBeenCalledWith("class-10a1", {
        student_id: "std-2",
        starts_on: "2024-09-05",
      });
    });

    expect(await screen.findByText("Xếp học sinh vào lớp thành công.")).toBeInTheDocument();
  });

  it("displays inline Vietnamese error on creation failure", async () => {
    useSessionMock.mockReturnValue(session(["academics.structure.read", "academics.structure.manage"]));
    listGradeLevelsMock.mockResolvedValue([]);
    createGradeLevelMock.mockRejectedValue(new Error("Grade level code already exists"));

    renderComponent();

    const addGradeBtn = await screen.findByRole("button", { name: "Thêm khối lớp" });
    fireEvent.click(addGradeBtn);

    fireEvent.change(screen.getByLabelText(/Mã khối lớp \(Code\)/), { target: { value: "G10" } });
    fireEvent.change(screen.getByLabelText(/Tên hiển thị khối lớp/), { target: { value: "Khối 10" } });

    const submitGradeBtn = screen.getByRole("button", { name: "Lưu thông tin khối lớp" });
    await act(async () => {
      fireEvent.submit(submitGradeBtn.closest("form")!);
    });

    expect(await screen.findByText("Mã khối lớp đã tồn tại trong hệ thống.")).toBeInTheDocument();
  });
});
