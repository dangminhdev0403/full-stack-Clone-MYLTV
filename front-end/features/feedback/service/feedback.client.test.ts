import { afterEach, describe, expect, it, vi } from "vitest";
import { getFeedback, listFeedback, updateFeedbackStatus } from "./feedback.client";

const validItem = {
  id: "feedback-1",
  student_id: "student-1",
  account_id: null,
  title: "Góp ý bán trú",
  content: "Bữa ăn cần nóng hơn",
  category: "service",
  status: "new",
  attachments: [],
  created_at: "2026-07-26T00:00:00.000Z",
  updated_at: "2026-07-26T00:00:00.000Z",
};

afterEach(() => vi.unstubAllGlobals());

describe("feedback client", () => {
  it("maps list query to BFF and parses the strict envelope", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      success: true,
      data: { items: [validItem], page: 2, page_size: 10, total: 11, has_next: true },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(listFeedback({ page: 2, page_size: 10, q: "bán", status: "new" })).resolves.toMatchObject({
      items: [expect.objectContaining({ id: "feedback-1" })],
      page: 2,
      page_size: 10,
      total: 11,
      has_next: true,
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/feedback?page=2&page_size=10&q=b%C3%A1n&status=new", { cache: "no-store" });
  });

  it("fail-closes on raw arrays or malformed envelopes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([validItem])));
    await expect(listFeedback()).rejects.toThrow();

    const missingRequiredField = Object.fromEntries(
      Object.entries(validItem).filter(([key]) => key !== "attachments"),
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({
      success: true,
      data: { items: [missingRequiredField], page: 1, page_size: 20, total: 1, has_next: false },
    })));
    await expect(listFeedback()).rejects.toThrow();
  });

  it("maps detail and status update through BFF", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: true, data: validItem }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { ...validItem, status: "resolved" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getFeedback("feedback-1")).resolves.toMatchObject({ id: "feedback-1" });
    await expect(updateFeedbackStatus("feedback-1", "resolved")).resolves.toMatchObject({ status: "resolved" });
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/admin/feedback/feedback-1", { cache: "no-store" });
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/admin/feedback/feedback-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved" }),
    });
  });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
