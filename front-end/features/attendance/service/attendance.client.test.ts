import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createAttendanceSession,
  listAttendanceSessions,
  updateAttendanceSession,
} from "./attendance.client";

afterEach(() => vi.unstubAllGlobals());

describe("attendance client", () => {
  it("lists sessions with typed student records", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(response({ success: true, data: listData() }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await listAttendanceSessions(
      "?date=2026-07-18&class_name=6A1",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/attendance?date=2026-07-18&class_name=6A1",
      { cache: "no-store" },
    );
    expect(result.items[0].records[0].student_code).toBe("UAT-HS-001");
  });

  it("creates and updates complete attendance records", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(response({ success: true, data: listData().items[0] })),
      );
    vi.stubGlobal("fetch", fetchMock);
    const payload = {
      date: "2026-07-18",
      class_name: "6A1",
      period: "morning" as const,
      records: [
        { student_id: "student-1", status: "present" as const, note: null },
      ],
    };
    await createAttendanceSession(payload);
    await updateAttendanceSession("session-1", { records: payload.records });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/admin/attendance",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin/attendance/session-1",
      expect.objectContaining({ method: "PATCH" }),
    );
  });
});

function response(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
function listData() {
  return {
    items: [
      {
        id: "session-1",
        date: "2026-07-18",
        period: "morning",
        class_name: "6A1",
        semester_id: "semester-1",
        counts: { present: 1, absent: 0, late: 0, excused: 0 },
        records: [
          {
            id: "record-1",
            student_id: "student-1",
            student_code: "UAT-HS-001",
            student_name: "Nguyễn Minh Anh",
            avatar_url: null,
            grade: "6",
            class_name: "6A1",
            status: "present",
            note: null,
          },
        ],
      },
    ],
    page: 1,
    page_size: 20,
    total: 1,
    has_next: false,
  };
}
