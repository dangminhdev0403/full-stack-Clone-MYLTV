import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FeedbackPage } from "./feedback-page";
import { useFeedbackDetailQuery, useFeedbackQuery, useUpdateFeedbackStatusMutation } from "../hooks/use-feedback";

const sessionUser = { role: "admin", permissions: ["communication.feedback.read", "communication.feedback.manage"] };

vi.mock("next-auth/react", () => ({ useSession: () => ({ data: { user: sessionUser } }) }));
vi.mock("@/features/admin-shell", () => ({
  AdminShell: ({ children, title }: { children: React.ReactNode; title: string }) => <main><h1>{title}</h1>{children}</main>,
  Icon: ({ name }: { name: string }) => <span aria-hidden="true">{name}</span>,
}));
vi.mock("../hooks/use-feedback", () => ({
  useFeedbackQuery: vi.fn(),
  useFeedbackDetailQuery: vi.fn(),
  useUpdateFeedbackStatusMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const listMock = vi.mocked(useFeedbackQuery);
const detailMock = vi.mocked(useFeedbackDetailQuery);
const updateMock = vi.mocked(useUpdateFeedbackStatusMutation);

describe("FeedbackPage", () => {
  it("shows the queue total and the status mix for the current page", () => {
    listMock.mockReturnValue({ ...queryResult([item(), item({ id: "feedback-2", status: "resolved" })]), data: { items: [item(), item({ id: "feedback-2", status: "resolved" })], page: 1, page_size: 10, total: 12, has_next: true } } as ReturnType<typeof useFeedbackQuery>);
    detailMock.mockReturnValue(detailResult(null) as ReturnType<typeof useFeedbackDetailQuery>);

    render(<FeedbackPage />);

    expect(screen.getByRole("region", { name: "Thống kê hàng đợi phản hồi" })).toHaveTextContent("12 phản hồi");
    expect(screen.getByText("Mới 1")).toBeInTheDocument();
    expect(screen.getByText("Đã xử lý 1")).toBeInTheDocument();
    expect(screen.getByText("Phân bổ trang hiện tại")).toBeInTheDocument();
  });
  it("sends search, status and pagination filters through the resource hook", () => {
    listMock.mockReturnValue(queryResult([item()]) as ReturnType<typeof useFeedbackQuery>);
    detailMock.mockReturnValue(detailResult(null) as ReturnType<typeof useFeedbackDetailQuery>);
    render(<FeedbackPage />);

    fireEvent.change(screen.getByLabelText("Tìm phản hồi"), { target: { value: "bữa ăn" } });
    fireEvent.change(screen.getByLabelText("Lọc trạng thái"), { target: { value: "new" } });
    fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }));

    expect(listMock).toHaveBeenLastCalledWith({
      page: 1,
      page_size: 10,
      q: "bữa ăn",
      status: "new",
    });
  });

  it("loads detail and updates status when manage permission exists", () => {
    const mutate = vi.fn();
    listMock.mockReturnValue(queryResult([item()]) as ReturnType<typeof useFeedbackQuery>);
    detailMock.mockReturnValue(detailResult(item()) as ReturnType<typeof useFeedbackDetailQuery>);
    updateMock.mockReturnValue({ mutate, isPending: false } as ReturnType<typeof useUpdateFeedbackStatusMutation>);

    render(<FeedbackPage />);
    fireEvent.click(screen.getByRole("button", { name: "Xem chi tiết Góp ý bán trú" }));
    expect(detailMock).toHaveBeenLastCalledWith("feedback-1", { enabled: true });
    fireEvent.change(screen.getByLabelText("Cập nhật trạng thái"), { target: { value: "resolved" } });
    expect(mutate).toHaveBeenCalledWith({ id: "feedback-1", status: "resolved" }, expect.anything());
  });

  it("announces status update failures", () => {
    const mutate = vi.fn((_payload, options) => options.onError());
    listMock.mockReturnValue(queryResult([item()]) as ReturnType<typeof useFeedbackQuery>);
    detailMock.mockReturnValue(detailResult(item()) as ReturnType<typeof useFeedbackDetailQuery>);
    updateMock.mockReturnValue({ mutate, isPending: false } as unknown as ReturnType<typeof useUpdateFeedbackStatusMutation>);

    render(<FeedbackPage />);
    fireEvent.change(screen.getByLabelText("Cập nhật trạng thái"), {
      target: { value: "resolved" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Không thể cập nhật trạng thái phản hồi.",
    );
  });

  it("hides status update control without manage permission", () => {
    sessionUser.permissions = ["communication.feedback.read"];
    listMock.mockReturnValue(queryResult([item()]) as ReturnType<typeof useFeedbackQuery>);
    detailMock.mockReturnValue(detailResult(item()) as ReturnType<typeof useFeedbackDetailQuery>);

    render(<FeedbackPage />);
    expect(screen.queryByLabelText("Cập nhật trạng thái")).not.toBeInTheDocument();
    sessionUser.permissions = ["communication.feedback.read", "communication.feedback.manage"];
  });

  it("renders loading, error, empty and success states", () => {
    listMock.mockReturnValue({ data: undefined, isPending: true, isError: false, refetch: vi.fn() } as ReturnType<typeof useFeedbackQuery>);
    detailMock.mockReturnValue(detailResult(null) as ReturnType<typeof useFeedbackDetailQuery>);
    const { rerender } = render(<FeedbackPage />);
    expect(screen.getByRole("status")).toHaveTextContent("Đang tải phản hồi");

    listMock.mockReturnValue({ data: undefined, isPending: false, isError: true, refetch: vi.fn() } as ReturnType<typeof useFeedbackQuery>);
    rerender(<FeedbackPage />);
    expect(screen.getByRole("alert")).toHaveTextContent("Không thể tải phản hồi");

    listMock.mockReturnValue(queryResult([]) as ReturnType<typeof useFeedbackQuery>);
    rerender(<FeedbackPage />);
    expect(screen.getByText("Chưa có phản hồi phù hợp.")).toBeInTheDocument();

    const mutate = vi.fn((_payload, options) => options.onSuccess());
    listMock.mockReturnValue(queryResult([item()]) as ReturnType<typeof useFeedbackQuery>);
    detailMock.mockReturnValue(detailResult(item()) as ReturnType<typeof useFeedbackDetailQuery>);
    updateMock.mockReturnValue({ mutate, isPending: false } as unknown as ReturnType<typeof useUpdateFeedbackStatusMutation>);
    rerender(<FeedbackPage />);
    fireEvent.change(screen.getByLabelText("Cập nhật trạng thái"), { target: { value: "in_progress" } });
    expect(screen.getByText("Đã cập nhật trạng thái phản hồi.")).toBeInTheDocument();
  });
});

function queryResult(items: ReturnType<typeof item>[]) {
  return { data: { items, page: 1, page_size: 10, total: items.length, has_next: false }, isPending: false, isError: false, refetch: vi.fn() };
}
function detailResult(data: ReturnType<typeof item> | null) {
  return { data, isPending: false, isError: false, refetch: vi.fn() };
}
function item(overrides: Record<string, unknown> = {}) {
  return { id: "feedback-1", student_id: "student-1", account_id: null, title: "Góp ý bán trú", content: "Bữa ăn cần nóng hơn", category: "service", status: "new" as const, created_at: "2026-07-26T00:00:00.000Z", ...overrides };
}
