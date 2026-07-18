import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TuitionPage } from "./tuition-page";
import {
  createTuitionCharge,
  listTuitionCharges,
  updateTuitionCharge,
} from "../service/tuition.client";
import { listStudents } from "@/features/students/service/students.client";
import { getCurrentAcademicContext } from "@/features/admin-shell/service/academic-context.client";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        role: "admin",
        permissions: ["billing.tuition.read", "billing.tuition.manage"],
      },
    },
  }),
}));
vi.mock("@/features/admin-shell", () => ({
  AdminShell: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
  Icon: ({ name }: { name: string }) => <span>{name}</span>,
}));
vi.mock("../service/tuition.client", () => ({
  listTuitionCharges: vi.fn(),
  createTuitionCharge: vi.fn(),
  updateTuitionCharge: vi.fn(),
}));
vi.mock("@/features/students/service/students.client", () => ({
  listStudents: vi.fn(),
}));
vi.mock("@/features/admin-shell/service/academic-context.client", () => ({
  getCurrentAcademicContext: vi.fn(),
}));
const listMock = vi.mocked(listTuitionCharges);
const createMock = vi.mocked(createTuitionCharge);
const updateMock = vi.mocked(updateTuitionCharge);
const charge = {
  id: "charge-1",
  student_id: "student-1",
  student_code: "UAT-HS-001",
  student_name: "Nguyễn Minh Anh",
  grade: "6",
  class_name: "6A1",
  semester_id: "semester-1",
  semester_name: "Học kỳ 1",
  academic_year_id: "year-1",
  academic_year_name: "2026-2027",
  title: "Học phí học kỳ 1",
  amount_due: 10000000,
  amount_paid: 4000000,
  amount_outstanding: 6000000,
  status: "partial" as const,
  due_date: "2026-09-15",
  note: null,
  is_waived: false,
  created_at: "2026-07-18T00:00:00.000Z",
  updated_at: "2026-07-18T00:00:00.000Z",
};
const result = {
  items: [charge],
  page: 1,
  page_size: 20,
  total: 1,
  has_next: false,
  summary: {
    amount_due: 10000000,
    amount_paid: 4000000,
    amount_outstanding: 6000000,
  },
};
beforeEach(() => {
  vi.clearAllMocks();
  listMock.mockResolvedValue(result);
  vi.mocked(getCurrentAcademicContext).mockResolvedValue({
    academicYear: {
      id: "year-1",
      code: "2026-2027",
      displayName: "2026-2027",
      startsOn: "2026-08-01",
      endsOn: "2027-05-31",
    },
    semester: {
      id: "semester-1",
      code: "1",
      displayName: "Học kỳ 1",
      startsOn: "2026-08-01",
      endsOn: "2026-12-31",
      sortOrder: 1,
    },
  });
  vi.mocked(listStudents).mockResolvedValue({
    items: [
      {
        id: "student-1",
        code: "UAT-HS-001",
        full_name: "Nguyễn Minh Anh",
        avatar_url: null,
        grade: "6",
        class_name: "6A1",
        school_name: "LTV",
        is_active: true,
        created_at: "",
        updated_at: "",
      },
    ],
    page: 1,
    page_size: 100,
    total: 1,
    has_next: false,
  });
});
function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <TuitionPage />
    </QueryClientProvider>,
  );
}
describe("TuitionPage", () => {
  it("shows backend summary and filters by class/status", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByText("10.000.000 ₫")).toBeInTheDocument();
    expect(screen.getAllByText("6.000.000 ₫")).toHaveLength(2);
    await user.type(screen.getByLabelText("Lớp"), "6A1");
    await user.selectOptions(screen.getByLabelText("Trạng thái"), "partial");
    await user.click(screen.getByRole("button", { name: "Lọc học phí" }));
    expect(listMock).toHaveBeenLastCalledWith(
      expect.stringContaining("class_name=6A1"),
    );
    expect(listMock).toHaveBeenLastCalledWith(
      expect.stringContaining("status=partial"),
    );
  });
  it("creates a charge from active students and current semester", async () => {
    const user = userEvent.setup();
    createMock.mockResolvedValue(charge);
    renderPage();
    await screen.findByText("Nguyễn Minh Anh");
    await user.click(screen.getByRole("button", { name: "Tạo khoản thu" }));
    await user.selectOptions(screen.getByLabelText("Học sinh"), "student-1");
    await user.type(screen.getByLabelText("Tên khoản thu"), "Học phí học kỳ 1");
    await user.type(screen.getByLabelText("Số tiền phải thu"), "10000000");
    await user.click(screen.getByRole("button", { name: "Lưu khoản thu" }));
    expect(createMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        student_id: "student-1",
        semester_id: "semester-1",
        amount_due: 10000000,
      }),
    );
  });
  it("updates amount paid and announces success", async () => {
    const user = userEvent.setup();
    updateMock.mockResolvedValue({
      ...charge,
      amount_paid: 10000000,
      amount_outstanding: 0,
      status: "paid",
    });
    renderPage();
    await screen.findByText("Nguyễn Minh Anh");
    await user.click(
      screen.getByRole("button", { name: "Cập nhật Nguyễn Minh Anh" }),
    );
    const paid = screen.getByLabelText("Số tiền đã thu");
    await user.clear(paid);
    await user.type(paid, "10000000");
    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    expect(updateMock).toHaveBeenCalledWith(
      "charge-1",
      expect.objectContaining({ amount_paid: 10000000 }),
    );
    expect(
      await screen.findByText("Đã cập nhật khoản thu."),
    ).toBeInTheDocument();
  });
});
