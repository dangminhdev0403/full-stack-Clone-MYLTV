import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "./callback-url";

describe("safeCallbackUrl", () => {
  it("keeps internal paths and their query string", () => {
    expect(safeCallbackUrl("/admin/students?page=2")).toBe("/admin/students?page=2");
  });

  it.each(["https://evil.test", "//evil.test/admin", "/login?callbackUrl=/login", "javascript:alert(1)"])(
    "rejects unsafe callback %s",
    (value) => expect(safeCallbackUrl(value)).toBe("/admin"),
  );
});
