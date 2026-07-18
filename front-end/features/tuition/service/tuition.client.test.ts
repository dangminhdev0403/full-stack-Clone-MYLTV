import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createTuitionCharge,
  getTuitionCharge,
  listTuitionCharges,
  updateTuitionCharge,
} from "./tuition.client";

const item = {
  id: "charge-1",
  student_id: "student-1",
  student_code: "UAT-HS-001",
  student_name: "Nguyễn Minh Anh",
  grade: "6",
  class_name: "6A1",
  semester_id: "semester-1",
  semester_name: "Học kỳ 1",
  academic_year_id: "year-1",
  academic_year_name: "2026-2027",
  title: "Học phí học kỳ 1",
  amount_due: 10000000,
  amount_paid: 4000000,
  amount_outstanding: 6000000,
  status: "partial",
  due_date: "2026-09-15",
  note: null,
  is_waived: false,
  created_at: "2026-07-18T00:00:00.000Z",
  updated_at: "2026-07-18T00:00:00.000Z",
};
afterEach(() => vi.unstubAllGlobals());

describe("tuition client", () => {
  it("lists and gets typed charges", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        response({
          success: true,
          data: {
            items: [item],
            page: 1,
            page_size: 20,
            total: 1,
            has_next: false,
            summary: {
              amount_due: 10000000,
              amount_paid: 4000000,
              amount_outstanding: 6000000,
            },
          },
        }),
      )
      .mockResolvedValueOnce(response({ success: true, data: item }));
    vi.stubGlobal("fetch", fetchMock);
    expect(
      (await listTuitionCharges("?class_name=6A1")).summary.amount_outstanding,
    ).toBe(6000000);
    expect((await getTuitionCharge("charge-1")).status).toBe("partial");
  });

  it("creates and updates using separate write payloads", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ success: true, data: item }, 201))
      .mockResolvedValueOnce(
        response({
          success: true,
          data: {
            ...item,
            amount_paid: 10000000,
            amount_outstanding: 0,
            status: "paid",
          },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);
    await createTuitionCharge({
      student_id: "student-1",
      semester_id: "semester-1",
      title: "Học phí học kỳ 1",
      amount_due: 10000000,
      amount_paid: 0,
      due_date: null,
      note: null,
      is_waived: false,
    });
    await updateTuitionCharge("charge-1", { amount_paid: 10000000 });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/admin/tuition",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin/tuition/charge-1",
      expect.objectContaining({ method: "PATCH" }),
    );
  });
});
function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
