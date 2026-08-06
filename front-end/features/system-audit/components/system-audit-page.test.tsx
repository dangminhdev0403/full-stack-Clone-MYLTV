import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSession } from "next-auth/react";
import { useAuditLogsQuery } from "../hooks/use-system-audit";
import { SystemAuditPage } from "./system-audit-page";

vi.mock("next-auth/react", () => ({ useSession: vi.fn() }));
vi.mock("../hooks/use-system-audit", () => ({ useAuditLogsQuery: vi.fn() }));
vi.mock("@/features/admin-shell", () => ({ AdminShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));

const sessionMock = vi.mocked(useSession);
const queryMock = vi.mocked(useAuditLogsQuery);
const refetch = vi.fn();

function result(overrides: Record<string, unknown> = {}) {
  return { data: undefined, isPending: false, isError: false, refetch, ...overrides } as unknown as ReturnType<typeof useAuditLogsQuery>;
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionMock.mockReturnValue({ data: { user: { role: "admin", permissions: ["identity.audit.read"] } } } as unknown as ReturnType<typeof useSession>);
  queryMock.mockReturnValue(result({ data: { audit_logs: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 0 } } }));
});

describe("SystemAuditPage", () => {
  it("denies missing permission and disables the query", () => {
    sessionMock.mockReturnValue({ data: { user: { role: "admin", permissions: [] } } } as unknown as ReturnType<typeof useSession>);
    render(<SystemAuditPage />);
    expect(screen.getByRole("alert")).toHaveTextContent("không có quyền");
    expect(queryMock).toHaveBeenCalledWith(expect.anything(), { enabled: false });
  });

  it("renders loading and retry states", () => {
    queryMock.mockReturnValue(result({ isPending: true }));
    const { rerender } = render(<SystemAuditPage />);
    expect(screen.getByRole("status")).toHaveTextContent("Đang tải");
    queryMock.mockReturnValue(result({ isError: true }));
    rerender(<SystemAuditPage />);
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(refetch).toHaveBeenCalled();
  });

  it("applies filters, paginates and opens accessible metadata detail", () => {
    queryMock.mockReturnValue(result({ data: { audit_logs: [{ id: "audit-1", actor_id: "actor-1", action: "ROLE_UPDATE", bounded_context: "identity_access", resource_type: "role", resource_id: "role-1", metadata: { safe: true }, created_at: "2026-08-06T00:00:00.000Z" }], pagination: { page: 1, limit: 20, total: 21, total_pages: 2 } } }));
    render(<SystemAuditPage />);
    fireEvent.change(screen.getByLabelText("Actor ID"), { target: { value: "actor-1" } });
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng bộ lọc" }));
    expect(queryMock).toHaveBeenLastCalledWith(expect.objectContaining({ actor_id: "actor-1" }), { enabled: true });
    fireEvent.click(screen.getByRole("button", { name: "Xem chi tiết ROLE_UPDATE" }));
    expect(screen.getByRole("dialog", { name: "Chi tiết nhật ký ROLE_UPDATE" })).toHaveTextContent('"safe": true');
    fireEvent.click(screen.getByRole("button", { name: "Đóng" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Trang sau" }));
    expect(queryMock).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }), { enabled: true });
  });
});
