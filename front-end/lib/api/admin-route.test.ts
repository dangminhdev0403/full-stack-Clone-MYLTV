import { describe, expect, it } from "vitest";
import { resolveAdminEndpoint } from "./admin-route";

describe("admin BFF allowlist", () => {
  it("allows implemented user, student, news and academic context endpoint shapes", () => {
    expect(resolveAdminEndpoint("users", [], "GET")).toBe("/api/v1/users");
    expect(resolveAdminEndpoint("users", ["user-1", "disable"], "POST")).toBe("/api/v1/users/user-1/disable");
    expect(resolveAdminEndpoint("students", ["student-1", "accounts"], "PUT")).toBe("/api/v1/admin/students/student-1/accounts");
    expect(resolveAdminEndpoint("news", [], "GET")).toBe("/api/v1/admin/news");
    expect(resolveAdminEndpoint("news", ["news-1"], "PATCH")).toBe("/api/v1/admin/news/news-1");
    expect(resolveAdminEndpoint("news", ["news-1", "publish"], "POST")).toBe("/api/v1/admin/news/news-1/publish");
    expect(resolveAdminEndpoint("news", ["news-1", "reorder"], "POST")).toBe("/api/v1/admin/news/news-1/reorder");
    expect(resolveAdminEndpoint("academic-context", ["current"], "GET")).toBe("/api/v1/admin/academic-context/current");
  });

  it("rejects planned domains, traversal and unsupported methods", () => {
    expect(resolveAdminEndpoint("attendance", [], "GET")).toBe("/api/v1/admin/attendance");
    expect(() => resolveAdminEndpoint("users", [".."], "GET")).toThrow();
    expect(() => resolveAdminEndpoint("students", [], "DELETE")).toThrow();
  });
});
