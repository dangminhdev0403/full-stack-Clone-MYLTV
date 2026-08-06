import { describe, expect, it, vi } from "vitest";
import { promoteCohort, transferStudents } from "./academic-structure.client";

describe("academic-structure client transfers and promotions transport boundary", () => {
  it("parses valid transferStudents response with transferStudentsResponseSchema and omits idempotency_key in payload", async () => {
    const fakeResponseData = {
      transferred_count: 2,
      target_class_id: "class-2",
      student_ids: ["student-1", "student-2"],
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: fakeResponseData,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await transferStudents({
      student_ids: ["student-1", "student-2"],
      target_class_id: "class-2",
      reason: "Class balancing",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/academic-structure/transfers",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_ids: ["student-1", "student-2"],
          target_class_id: "class-2",
          reason: "Class balancing",
        }),
      }
    );

    expect(result).toEqual(fakeResponseData);

    vi.unstubAllGlobals();
  });

  it("throws ZodError on invalid transferStudents response structure", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          transferred_count: "invalid-number",
          target_class_id: "class-2",
          student_ids: ["student-1"],
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      transferStudents({
        student_ids: ["student-1"],
        target_class_id: "class-2",
      })
    ).rejects.toThrow();

    vi.unstubAllGlobals();
  });

  it("parses valid promoteCohort response with promoteCohortResponseSchema and omits idempotency_key in payload", async () => {
    const fakeResponseData = {
      promoted_count: 15,
      source_class_id: "class-1",
      target_class_id: "class-2",
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: fakeResponseData,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await promoteCohort({
      source_class_id: "class-1",
      target_class_id: "class-2",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/academic-structure/promotions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_class_id: "class-1",
          target_class_id: "class-2",
        }),
      }
    );

    expect(result).toEqual(fakeResponseData);

    vi.unstubAllGlobals();
  });

  it("throws ZodError on invalid promoteCohort response structure", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          promoted_count: 10,
          source_class_id: "class-1",
          // missing target_class_id
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      promoteCohort({
        source_class_id: "class-1",
        target_class_id: "class-2",
      })
    ).rejects.toThrow();

    vi.unstubAllGlobals();
  });
});
