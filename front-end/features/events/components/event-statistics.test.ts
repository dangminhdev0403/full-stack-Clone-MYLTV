import { describe, expect, it } from "vitest";
import { summarizeEvents } from "./event-statistics";

describe("summarizeEvents", () => {
  it("summarizes event lifecycle and registrations", () => {
    expect(summarizeEvents([{ status: "open", registration_count: 4 }, { status: "closed", registration_count: 2 }], 5)).toEqual({ total: 5, open: 1, closed: 1, registrations: 6 });
  });
});