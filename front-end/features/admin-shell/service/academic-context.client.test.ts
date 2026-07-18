import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentAcademicContext } from "./academic-context.client";

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal("fetch", fetchMock);

afterEach(() => fetchMock.mockReset());

describe("academic context client", () => {
  it("loads and maps the implemented current context endpoint", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: {
        academic_year: { id: "year-1", code: "2025-2026", display_name: "Năm học 2025–2026", starts_on: "2025-08-01", ends_on: "2026-05-31", is_current: true },
        semester: { id: "term-2", code: "semester-2", display_name: "Học kỳ II", starts_on: "2026-01-01", ends_on: "2026-05-31", sort_order: 2, is_current: true },
      },
    }), { headers: { "Content-Type": "application/json" } }));

    await expect(getCurrentAcademicContext()).resolves.toEqual({
      academicYear: expect.objectContaining({ displayName: "Năm học 2025–2026" }),
      semester: expect.objectContaining({ displayName: "Học kỳ II", sortOrder: 2 }),
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/academic-context/current", { cache: "no-store" });
  });
});