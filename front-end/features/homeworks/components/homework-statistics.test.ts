import { describe, expect, it } from "vitest";
import { summarizeHomeworks } from "./homework-statistics";

describe("summarizeHomeworks", () => {
  it("separates overdue, upcoming and completed work", () => {
    expect(summarizeHomeworks([
      { deadline: "2026-07-26T00:00:00.000Z", status: "pending", subject: "Toán" },
      { deadline: "2026-07-29T00:00:00.000Z", status: "pending", subject: "Văn" },
      { deadline: "2026-07-20T00:00:00.000Z", status: "submitted", subject: "Toán" },
    ], new Date("2026-07-27T00:00:00.000Z"))).toEqual({ total: 3, overdue: 1, upcoming: 1, completed: 1, subjects: 2 });
  });
});