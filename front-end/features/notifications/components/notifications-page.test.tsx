import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationsPage } from "./notifications-page";
import { useNotificationsQuery, useUpdateNotificationMutation } from "../hooks/use-notifications";

vi.mock("@/features/admin-shell", () => ({ AdminShell: ({ children, title }: { children: React.ReactNode; title: string }) => <main><h1>{title}</h1>{children}</main>, Icon: ({ name }: { name: string }) => <span aria-hidden="true">{name}</span> }));
vi.mock("../hooks/use-notifications", () => ({ useNotificationsQuery: vi.fn(), useCreateNotificationMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })), useUpdateNotificationMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })) }));

const queryMock = vi.mocked(useNotificationsQuery);
const updateMock = vi.mocked(useUpdateNotificationMutation);

describe("NotificationsPage", () => {
  it("sends search, tag and page filters through the resource hook", () => {
    queryMock.mockReturnValue(queryResult());
    render(<NotificationsPage />);
    fireEvent.change(screen.getByLabelText("Tìm thông báo"), { target: { value: "học" } });
    fireEvent.change(screen.getByLabelText("Lọc phân loại"), { target: { value: "Hoc tap" } });
    fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }));
    expect(queryMock).toHaveBeenLastCalledWith(expect.stringContaining("q=h%E1%BB%8Dc"));
    expect(queryMock).toHaveBeenLastCalledWith(expect.stringContaining("tag=Hoc+tap"));
  });

  it("opens edit form and submits a persisted update", () => {
    const mutate = vi.fn();
    updateMock.mockReturnValue({ mutate, isPending: false } as ReturnType<typeof useUpdateNotificationMutation>);
    queryMock.mockReturnValue(queryResult([item()]));
    render(<NotificationsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Sửa Thông báo" }));
    fireEvent.change(screen.getByLabelText("Tiêu đề thông báo"), { target: { value: "Cap nhat" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ id: "notification-1", payload: expect.objectContaining({ title: "Cap nhat" }) }), expect.anything());
  });
});

function queryResult(items: ReturnType<typeof item>[] = []) { return { data: { items, page: 1, page_size: 10, total: items.length, has_next: false }, isPending: false, isError: false, refetch: vi.fn() } as ReturnType<typeof useNotificationsQuery>; }
function item() { return { id: "notification-1", title: "Thông báo", sender: "BGH", sent_at: "2026-07-26T00:00:00.000Z", content: "Nội dung", tag: "Quan trong", created_at: "2026-07-26T00:00:00.000Z", updated_at: "2026-07-26T00:00:00.000Z" }; }
