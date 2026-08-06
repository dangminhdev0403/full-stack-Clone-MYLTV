import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewsPage } from "./news-page";
import { listNews, publishNews } from "../service/news.client";

vi.mock("next-auth/react", () => ({ useSession: vi.fn() }));
vi.mock("@/features/admin-shell", () => ({
  AdminShell: ({ children, title }: { children: React.ReactNode; title: string }) => <main><h1>{title}</h1>{children}</main>,
  Icon: ({ name }: { name: string }) => <span aria-hidden="true" data-testid={`icon-${name}`}>{name}</span>,
}));
vi.mock("../service/news.client", () => ({
  createNews: vi.fn(),
  getNews: vi.fn(),
  hideNews: vi.fn(),
  listNews: vi.fn(),
  pinNews: vi.fn(),
  publishNews: vi.fn(),
  reorderNews: vi.fn(),
  updateNews: vi.fn(),
}));

const useSessionMock = vi.mocked(useSession);
const listNewsMock = vi.mocked(listNews);
const publishNewsMock = vi.mocked(publishNews);

afterEach(() => vi.clearAllMocks());

describe("NewsPage", () => {
  it("labels workflow counts as the current page while preserving the API total", async () => {
    useSessionMock.mockReturnValue(session(["communication.news.read"]));
    listNewsMock.mockResolvedValue({ items: [news(), news({ id: "news-2", status: "published" })], page: 1, page_size: 20, total: 31, has_next: true });
    renderPage();
    expect(await screen.findByText("31")).toBeInTheDocument();
    expect(screen.getByText("Toàn bộ kết quả")).toBeInTheDocument();
    expect(screen.getByText("Trên trang hiện tại")).toBeInTheDocument();
  });
  it("shows loading then empty state from the real API boundary", async () => {
    useSessionMock.mockReturnValue(session(["communication.news.read"]));
    listNewsMock.mockResolvedValue({ items: [], page: 1, page_size: 20, total: 0, has_next: false });

    renderPage();

    expect(screen.getByText("Đang tải tin tức...")).toBeInTheDocument();
    expect(await screen.findByText("Chưa có tin tức phù hợp.")).toBeInTheDocument();
  });

  it("hides management actions without news.manage permission", async () => {
    useSessionMock.mockReturnValue(session(["communication.news.read"]));
    listNewsMock.mockResolvedValue({ items: [news()], page: 1, page_size: 20, total: 1, has_next: false });

    renderPage();

    expect(await screen.findByText("Thông báo hè")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tạo tin" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xuất bản" })).not.toBeInTheDocument();
  });

  it("filters accented backend categories and labels icon-only controls", async () => {
    useSessionMock.mockReturnValue(session(["communication.news.read", "communication.news.manage"]));
    listNewsMock.mockResolvedValue({
      items: [news({ category: "Thông báo" }), news({ id: "news-2", title: "Ngày hội", category: "Sự kiện" })],
      page: 1,
      page_size: 20,
      total: 2,
      has_next: false,
    });

    renderPage();
    fireEvent.change(screen.getByLabelText("Tìm tin tức"), { target: { value: "hè" } });
    expect(screen.getByRole("button", { name: "Xóa tìm kiếm" })).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: "Thông báo" }));
    expect(screen.getByText("Thông báo hè")).toBeInTheDocument();
    expect(screen.queryByText("Ngày hội")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tạo tin" }));
    expect(screen.getByRole("button", { name: "Đóng biểu mẫu" })).toBeInTheDocument();
  });

  it("allows a manager to publish and pin an item", async () => {
    useSessionMock.mockReturnValue(session(["communication.news.read", "communication.news.manage", "communication.news.publish"]));
    listNewsMock.mockResolvedValue({ items: [news()], page: 1, page_size: 20, total: 1, has_next: false });
    publishNewsMock.mockResolvedValue(news({ status: "published" }));

    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Xuất bản" }));

    await waitFor(() => expect(publishNewsMock).toHaveBeenCalledWith("news-1"));
    expect(screen.getByRole("button", { name: "Ghim tin" })).toBeInTheDocument();
  });
});

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}><NewsPage /></QueryClientProvider>);
}

function session(permissions: string[]) {
  return { data: { user: { id: "admin-1", display_name: "Admin", role: "admin", permissions }, expires: "2099-01-01" }, status: "authenticated", update: vi.fn() } as ReturnType<typeof useSession>;
}

function news(overrides: Record<string, unknown> = {}) {
  return { id: "news-1", title: "Thông báo hè", summary: "Lịch hoạt động", content: "Nội dung", image_url: null, category: "Thong bao", is_pinned: false, sort_order: 0, audiences: [{ type: "all", value: null }], published_at: null, created_at: "2026-07-16T00:00:00.000Z", updated_at: "2026-07-16T00:00:00.000Z", status: "draft" as const, ...overrides };
}
