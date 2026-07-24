import { describe, expect, it } from "vitest";
import { metadata } from "./page";

describe("login route metadata", () => {
  it("uses the login-specific page title", () => {
    expect(metadata.title).toBe("Đăng nhập | EduManager");
  });
});
