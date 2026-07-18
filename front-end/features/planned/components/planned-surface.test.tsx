import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PlannedSurface } from "./planned-surface";

const useSession = vi.fn();
const getCurrentAcademicContext = vi.fn();

vi.mock("next-auth/react", () => ({ useSession: () => useSession() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/admin/grades" }));
vi.mock("@/features/auth/hooks/use-logout", () => ({
  useLogout: () => ({ logout: vi.fn(), isLoggingOut: false }),
}));
vi.mock("@/features/admin-shell/service/academic-context.client", () => ({
  getCurrentAcademicContext: () => getCurrentAcademicContext(),
}));

describe("PlannedSurface", () => {
  beforeEach(() => {
    getCurrentAcademicContext.mockReset();
    useSession.mockReturnValue({
      data: { user: { display_name: "Giáo viên", role: "admin", permissions: [] } },
      status: "authenticated",
    });
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders a polished incomplete-feature page with orientation and zero fetches", () => {
    renderPlanned(<PlannedSurface title="Điểm số" activeHref="/admin/grades" description="Quản lý bảng điểm, nhận xét và kết quả học tập." />);

    expect(screen.getByRole("heading", { name: "Điểm số" })).toBeInTheDocument();
    expect(screen.getByText("Tính năng đang hoàn thiện")).toBeInTheDocument();
    expect(screen.getAllByText("Quản lý bảng điểm, nhận xét và kết quả học tập.")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Quay về Tổng quan" })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: /Điểm số/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("navigation", { name: "Đường dẫn trang" })).toHaveTextContent("Học tập");
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(getCurrentAcademicContext).not.toHaveBeenCalled();
  });
});

function renderPlanned(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}
