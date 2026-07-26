import { afterEach, describe, expect, it, vi } from "vitest";
import { getNotification, listNotifications, updateNotification } from "./notifications.client";

afterEach(() => vi.unstubAllGlobals());

describe("notifications admin client", () => {
  it("preserves pagination from the standard envelope", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ success: true, data: { items: [], page: 2, page_size: 10, total: 21, has_next: true } })));
    await expect(listNotifications("?page=2&page_size=10")).resolves.toEqual({ items: [], page: 2, page_size: 10, total: 21, has_next: true });
  });

  it("uses admin BFF detail and patch routes", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ success: true, data: item() }))
      .mockResolvedValueOnce(response({ success: true, data: item({ title: "Cap nhat" }) }));
    vi.stubGlobal("fetch", fetchMock);

    await getNotification("notification-1");
    await updateNotification("notification-1", { title: "Cap nhat" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/admin/notifications/notification-1", { cache: "no-store" });
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/admin/notifications/notification-1", expect.objectContaining({ method: "PATCH" }));
  });
});

function response(body: unknown) { return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } }); }
function item(overrides: Record<string, unknown> = {}) { return { id: "notification-1", title: "Thong bao", sender: "BGH", sent_at: "2026-07-26T00:00:00.000Z", content: "Noi dung", tag: "Quan trong", created_at: "2026-07-26T00:00:00.000Z", updated_at: "2026-07-26T00:00:00.000Z", ...overrides }; }
