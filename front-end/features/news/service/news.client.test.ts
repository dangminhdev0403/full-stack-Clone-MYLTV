import { afterEach, describe, expect, it, vi } from "vitest";
import { createNews, getNews, hideNews, listNews, pinNews, publishNews, reorderNews, updateNews } from "./news.client";

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal("fetch", fetchMock);

afterEach(() => fetchMock.mockReset());

describe("news client", () => {
  it("uses the contracted list and detail endpoints", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(success({ items: [news()], page: 1, page_size: 20, total: 1, has_next: false })))
      .mockResolvedValueOnce(jsonResponse(success(news())));

    await expect(listNews("?q=summer")).resolves.toMatchObject({ total: 1 });
    await expect(getNews("news-1")).resolves.toMatchObject({ id: "news-1" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/admin/news?q=summer", { cache: "no-store" });
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/admin/news/news-1", { cache: "no-store" });
  });

  it("sends exact create and update payloads", async () => {
    const createPayload = { title: "Thông báo hè", summary: "Lịch hoạt động", content: "Nội dung", image_url: null, category: "Thong bao" };
    fetchMock
      .mockResolvedValueOnce(jsonResponse(success(news())))
      .mockResolvedValueOnce(jsonResponse(success(news({ title: "Đã cập nhật" }))));

    await createNews(createPayload);
    await updateNews("news-1", { title: "Đã cập nhật" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/admin/news", expect.objectContaining({ method: "POST", body: JSON.stringify(createPayload) }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/admin/news/news-1", expect.objectContaining({ method: "PATCH", body: JSON.stringify({ title: "Đã cập nhật" }) }));
  });

  it("uses dedicated publish, hide, pin and reorder actions", async () => {
    fetchMock.mockImplementation(async () => jsonResponse(success(news())));
    await publishNews("news-1");
    await hideNews("news-1");
    await pinNews("news-1", true);
    await reorderNews("news-1", 3);
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/admin/news/news-1/publish", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/admin/news/news-1/hide", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/admin/news/news-1/pin", expect.objectContaining({ body: JSON.stringify({ is_pinned: true }) }));
    expect(fetchMock).toHaveBeenNthCalledWith(4, "/api/admin/news/news-1/reorder", expect.objectContaining({ body: JSON.stringify({ sort_order: 3 }) }));
  });
});

function news(overrides: Record<string, unknown> = {}) {
  return {
    id: "news-1",
    title: "Thông báo hè",
    summary: "Lịch hoạt động",
    content: "Nội dung",
    image_url: null,
    category: "Thong bao",
    is_pinned: false,
    published_at: "2026-07-16T00:00:00.000Z",
    status: "draft",
    sort_order: 0,
    audiences: [{ type: "all", value: null }],
    created_at: "2026-07-16T00:00:00.000Z",
    updated_at: "2026-07-16T00:00:00.000Z",
    ...overrides,
  };
}

function success(data: unknown) { return { success: true, data }; }
function jsonResponse(body: unknown) { return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } }); }
