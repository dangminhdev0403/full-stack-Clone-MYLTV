import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminShell } from "./admin-shell";

const logout = vi.fn();
const useSession = vi.fn();
const getCurrentAcademicContext = vi.fn();

vi.mock("next-auth/react", () => ({ useSession: () => useSession() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/admin/students" }));
vi.mock("@/features/auth/hooks/use-logout", () => ({
  useLogout: () => ({ logout, isLoggingOut: false }),
}));
vi.mock("../service/academic-context.client", () => ({
  getCurrentAcademicContext: () => getCurrentAcademicContext(),
}));

describe("AdminShell", () => {
  beforeEach(() => {
    logout.mockReset();
    getCurrentAcademicContext.mockReset();
    getCurrentAcademicContext.mockRejectedValue(new Error("unavailable"));
    useSession.mockReturnValue({
      data: { user: { display_name: "Nguyễn An", role: "super_admin", permissions: [] } },
      status: "authenticated",
    });
  });

  it("renders grouped production navigation, breadcrumbs and account logout", async () => {
    renderShell(<AdminShell activeHref="/admin/students" title="Học sinh">Nội dung</AdminShell>);

    const navigation = screen.getByRole("navigation", { name: "Điều hướng quản trị" });
    expect(within(navigation).getByRole("link", { name: /Tổng quan/ })).toHaveAttribute("href", "/admin");
    expect(within(navigation).getByRole("link", { name: /Học sinh/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("navigation", { name: "Đường dẫn trang" })).toHaveTextContent("Nhà trường");
    expect(await screen.findByText("Chưa có niên khóa")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mở menu tài khoản" }));
    expect(screen.getByRole("menu")).toHaveTextContent("Nguyễn An");
    fireEvent.click(screen.getByRole("menuitem", { name: "Đăng xuất" }));
    expect(logout).toHaveBeenCalledOnce();
  });

  it("hides destinations the current actor cannot read", () => {
    useSession.mockReturnValue({
      data: { user: { display_name: "Giáo viên", role: "admin", permissions: ["students.read"] } },
      status: "authenticated",
    });

    renderShell(<AdminShell activeHref="/admin/students" title="Học sinh">Nội dung</AdminShell>);

    expect(screen.getByRole("link", { name: /Học sinh/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Người dùng/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Tin tức/ })).not.toBeInTheDocument();
  });

  it("focuses the mobile drawer, closes it with Escape and returns focus to its trigger", () => {
    renderShell(<AdminShell activeHref="/admin" title="Tổng quan">Nội dung</AdminShell>);

    const menuTrigger = screen.getByRole("button", { name: "Mở menu điều hướng" });
    fireEvent.click(menuTrigger);
    expect(screen.getByRole("dialog", { name: "Điều hướng quản trị" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đóng menu điều hướng" })).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: "Điều hướng quản trị" })).not.toBeInTheDocument();
    expect(menuTrigger).toHaveFocus();
  });

  it("cycles Tab from the last mobile drawer control to its close control", () => {
    renderShell(<AdminShell activeHref="/admin" title="Tổng quan">Nội dung</AdminShell>);

    fireEvent.click(screen.getByRole("button", { name: "Mở menu điều hướng" }));
    const dialog = screen.getByRole("dialog", { name: "Điều hướng quản trị" });
    const links = within(dialog).getAllByRole("link");
    const lastLink = links[links.length - 1];

    lastLink.focus();
    fireEvent.keyDown(document, { key: "Tab" });

    expect(screen.getByRole("button", { name: "Đóng menu điều hướng" })).toHaveFocus();
  });

  it("cycles Shift+Tab from the mobile drawer close control to its last control", () => {
    renderShell(<AdminShell activeHref="/admin" title="Tổng quan">Nội dung</AdminShell>);

    fireEvent.click(screen.getByRole("button", { name: "Mở menu điều hướng" }));
    const dialog = screen.getByRole("dialog", { name: "Điều hướng quản trị" });
    const links = within(dialog).getAllByRole("link");
    const lastLink = links[links.length - 1];

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });

    expect(lastLink).toHaveFocus();
  });

  it("uses mobile drawer, tablet rail and labeled desktop sidebar breakpoints", () => {
    const { container } = renderShell(<AdminShell activeHref="/admin/students" title="Học sinh">Nội dung</AdminShell>);

    const desktopSidebar = container.querySelector("main > aside");
    const content = container.querySelector("main > div");
    const studentsLabel = screen.getAllByText("Học sinh").find((element) => element.tagName === "SPAN");

    expect(desktopSidebar).toHaveClass("hidden", "md:flex", "w-20", "lg:w-[260px]");
    expect(content).toHaveClass("md:ml-20", "lg:ml-[260px]");
    expect(studentsLabel).toHaveClass("md:hidden", "lg:inline");
  });
});

function renderShell(shell: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{shell}</QueryClientProvider>);
}
