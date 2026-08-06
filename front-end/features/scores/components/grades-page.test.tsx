import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GradesPage } from "./grades-page";
import { getScores, saveScore } from "../service/scores.client";
import { listAcademicYears, listClasses, listSemesters } from "@/features/academic-structure/service/academic-structure.client";
import { listStudents } from "@/features/students/service/students.client";

let mockSession = {
  data: {
    user: {
      role: "super_admin",
      permissions: ["academics.scores.read", "academics.scores.manage"],
    },
  },
};

vi.mock("next-auth/react", () => ({
  useSession: () => mockSession,
}));

vi.mock("@/features/admin-shell", () => ({
  AdminShell: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}));

vi.mock("../service/scores.client", () => ({
  getScores: vi.fn(),
  getStudentRewards: vi.fn(),
  saveScore: vi.fn(),
  saveRewardDiscipline: vi.fn(),
  summarizeScores: vi.fn(),
}));

vi.mock("@/features/academic-structure/service/academic-structure.client", () => ({
  listAcademicYears: vi.fn(),
  listSemesters: vi.fn(),
  listClasses: vi.fn(),
}));

vi.mock("@/features/students/service/students.client", () => ({
  listStudents: vi.fn(),
}));

const getScoresMock = vi.mocked(getScores);
const saveScoreMock = vi.mocked(saveScore);
const yearsMock = vi.mocked(listAcademicYears);
const semestersMock = vi.mocked(listSemesters);
const classesMock = vi.mocked(listClasses);
const studentsMock = vi.mocked(listStudents);

afterEach(() => {
  vi.clearAllMocks();
  mockSession = {
    data: {
      user: {
        role: "super_admin",
        permissions: ["academics.scores.read", "academics.scores.manage"],
      },
    },
  };
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <GradesPage />
    </QueryClientProvider>
  );
}

describe("GradesPage Component", () => {
  it("renders grades page title, filters, and statistics summary", async () => {
    yearsMock.mockResolvedValue([{ id: "y1", code: "2026-2027", display_name: "2026-2027", starts_on: "2026-09-01", ends_on: "2027-06-01", is_current: true }]);
    semestersMock.mockResolvedValue([{ id: "s1", academic_year_id: "y1", code: "HK1", display_name: "Học kỳ 1", starts_on: "2026-09-01", ends_on: "2027-01-15", sort_order: 1, is_current: true }]);
    classesMock.mockResolvedValue([{ id: "c1", academic_year_id: "y1", grade_level_id: "g1", code: "10A1", display_name: "Lớp 10A1", is_active: true }]);
    studentsMock.mockResolvedValue({ items: [{ id: "st1", code: "HS001", full_name: "Nguyễn Văn A", avatar_url: null, grade: "10", class_name: "10A1", school_name: "School", is_active: true, created_at: "", updated_at: "" }], page: 1, page_size: 20, total: 1, has_next: false });
    getScoresMock.mockResolvedValue([
      {
        id: "sc1",
        student_id: "st1",
        subject_id: "math",
        subject_name: "Toán Học",
        oral_scores: [8, 9],
        fifteen_min_scores: [8.5],
        midterm_score: 8,
        final_score: 9,
        average_score: 8.5,
        teacher_comment: "Học tập tốt",
      },
    ]);

    renderPage();

    expect(await screen.findByRole("heading", { name: "Điểm số" })).toBeInTheDocument();
    expect(await screen.findByText("Toán Học")).toBeInTheDocument();
    expect(screen.getByText("Học tập tốt")).toBeInTheDocument();
    expect(screen.getAllByText("8.5").length).toBeGreaterThan(0);
  });

  it("shows error state with retry button when query fails", async () => {
    yearsMock.mockResolvedValue([]);
    semestersMock.mockResolvedValue([]);
    classesMock.mockResolvedValue([]);
    studentsMock.mockResolvedValue({ items: [], page: 1, page_size: 20, total: 0, has_next: false });
    getScoresMock.mockRejectedValue(new Error("Lỗi kết nối máy chủ"));

    renderPage();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Không thể tải danh sách điểm số.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thử tải lại" })).toBeInTheDocument();
  });

  it("shows permission denied notice when user lacks read permission", async () => {
    mockSession = {
      data: {
        user: {
          role: "admin",
          permissions: [],
        },
      },
    };

    renderPage();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Không có quyền truy cập")).toBeInTheDocument();
  });

  it("opens score modal and saves score mutation with validation", async () => {
    const user = userEvent.setup();
    yearsMock.mockResolvedValue([]);
    semestersMock.mockResolvedValue([]);
    classesMock.mockResolvedValue([]);
    studentsMock.mockResolvedValue({
      items: [
        { id: "st1", code: "HS001", full_name: "Nguyễn Văn A", avatar_url: null, grade: "10", class_name: "10A1", school_name: "School", is_active: true, created_at: "", updated_at: "" },
      ],
      page: 1,
      page_size: 20,
      total: 1,
      has_next: false,
    });
    getScoresMock.mockResolvedValue([]);
    saveScoreMock.mockResolvedValue({
      id: "sc2",
      student_id: "st1",
      subject_id: "math",
      subject_name: "Toán Học",
      oral_scores: [9],
      fifteen_min_scores: [9],
      midterm_score: 9,
      final_score: 9,
      average_score: 9,
      teacher_comment: "Giỏi",
    });

    renderPage();

    const openBtn = await screen.findByRole("button", { name: "+ Cập Nhật Điểm" });
    await user.click(openBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: "Lưu Điểm" });
    await user.click(submitBtn);

    expect(saveScoreMock).toHaveBeenCalled();
  });
});
