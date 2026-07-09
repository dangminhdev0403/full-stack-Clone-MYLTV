import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let service: typeof import("./admin-management.service");
const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

beforeEach(async () => {
  vi.useFakeTimers();
  fetchMock.mockReset();
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3100");
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("window", undefined);
  vi.resetModules();
  service = await import("./admin-management.service");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("admin-management.service", () => {
  it("uses the configured admin management API base", () => {
    expect(service.getAdminManagementApiBase()).toBe("http://localhost:3100/api/v1/admin/management");
  });

  it("logs admin API requests with safe structured fields", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: { id: "news-2", title: "Created" } }));

    await expect(service.createAdminManagementRecord("news", { title: "Created", secret_note: "do-not-log-value" })).resolves.toEqual({ id: "news-2", title: "Created" });

    expect(infoSpy).toHaveBeenCalledWith(
      "[admin-management-api] request completed",
      expect.objectContaining({
        scope: "admin-management-api",
        method: "POST",
        url: "http://localhost:3100/api/v1/admin/management/news",
        path: "/api/v1/admin/management/news",
        status: 200,
        ok: true,
        payloadKeys: ["secret_note", "title"],
      }),
    );
    expect(JSON.stringify(infoSpy.mock.calls)).not.toContain("do-not-log-value");
  });

  it("returns blocked surfaces when backend inventory cannot be loaded", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: false, message: "database unavailable" }, { status: 500 }));

    const catalog = await service.listAdminManagementCatalog();

    expect(catalog.length).toBeGreaterThan(0);
    expect(catalog.every((surface) => surface.source === "blocked")).toBe(true);
    expect(catalog[0].supports).toEqual({ list: false, detail: false, create: false, update: false });
    expect(catalog[0].error).toContain("Không tải được inventory backend /api/v1/admin/management: database unavailable");
  });

  it("marks a domain blocked when inventory omits list support", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: [{ domain: "news", androidEndpoints: [], basePath: "/api/v1/admin/management/news", supports: { list: false, detail: true, create: true, update: true } }],
      }),
    );

    const surface = await service.getAdminManagementCatalogItem("news");

    expect(surface?.source).toBe("blocked");
    expect(surface?.records).toEqual([]);
    expect(surface?.supports).toEqual({ list: false, detail: false, create: false, update: false });
    expect(surface?.error).toBe("Backend inventory chưa khai báo list endpoint cho domain này.");
  });

  it("loads backend records and maps list responses when inventory supports list", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: [{ domain: "news", androidEndpoints: [], basePath: "/api/v1/admin/management/news", supports: { list: true, detail: true, create: true, update: true } }],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: {
            items: [{ id: "news-1", title: "Backend headline", summary: "Backend summary", is_pinned: true, updated_at: "2026-07-09T00:00:00.000Z", category: "Tin tuc" }],
            pagination: { page: 1, limit: 20, total: 1 },
          },
        }),
      );

    const surface = await service.getAdminManagementCatalogItem("news");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "http://localhost:3100/api/v1/admin/management", expect.objectContaining({ cache: "no-store" }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "http://localhost:3100/api/v1/admin/management/news?limit=20", expect.objectContaining({ cache: "no-store" }));
    expect(surface?.source).toBe("backend");
    expect(surface?.supports).toEqual({ list: true, detail: true, create: true, update: true });
    expect(surface?.records[0]).toMatchObject({ id: "news-1", title: "Backend headline", subtitle: "Backend summary", status: "Đang ghim", owner: "Tin tuc" });
    expect(surface?.pagination).toEqual({ page: 1, limit: 20, total: 1 });
  });

  it("sends detail, create, and update requests through backend envelopes", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { id: "news-1", title: "Detail" } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { id: "news-2", title: "Created" } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { id: "news-1", title: "Updated" } }));

    await expect(service.getAdminManagementRecordDetail("news", "news-1")).resolves.toEqual({ id: "news-1", title: "Detail" });
    await expect(service.createAdminManagementRecord("news", { title: "Created" })).resolves.toEqual({ id: "news-2", title: "Created" });
    await expect(service.updateAdminManagementRecord("news", "news-1", { title: "Updated" })).resolves.toEqual({ id: "news-1", title: "Updated" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "http://localhost:3100/api/v1/admin/management/news/news-1", expect.objectContaining({ headers: { Accept: "application/json" } }));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3100/api/v1/admin/management/news",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ title: "Created" }) }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "http://localhost:3100/api/v1/admin/management/news/news-1",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ title: "Updated" }) }),
    );
  });

  it("surfaces backend mutation errors", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: false, message: "Prisma table missing" }, { status: 500 }));

    await expect(service.createAdminManagementRecord("news", { title: "Broken" })).rejects.toThrow("Prisma table missing");
  });
});
