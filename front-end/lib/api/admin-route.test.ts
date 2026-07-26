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
    expect(resolveAdminEndpoint("notifications", ["notification-1"], "GET")).toBe("/api/v1/admin/notifications/notification-1");
    expect(resolveAdminEndpoint("notifications", ["notification-1"], "PATCH")).toBe("/api/v1/admin/notifications/notification-1");
  });

  it("allows attendance, tuition and feedback domain routes", () => {
    expect(resolveAdminEndpoint("attendance", [], "GET")).toBe("/api/v1/admin/attendance");
    expect(resolveAdminEndpoint("tuition", [], "GET")).toBe("/api/v1/admin/tuition");
    expect(resolveAdminEndpoint("tuition", [], "POST")).toBe("/api/v1/admin/tuition");
    expect(resolveAdminEndpoint("tuition", ["charge-1"], "GET")).toBe("/api/v1/admin/tuition/charge-1");
    expect(resolveAdminEndpoint("tuition", ["charge-1"], "PATCH")).toBe("/api/v1/admin/tuition/charge-1");
    expect(resolveAdminEndpoint("feedback", [], "GET")).toBe("/api/v1/admin/feedback");
    expect(resolveAdminEndpoint("feedback", ["feedback-1"], "GET")).toBe("/api/v1/admin/feedback/feedback-1");
    expect(resolveAdminEndpoint("feedback", ["feedback-1"], "PATCH")).toBe("/api/v1/admin/feedback/feedback-1");
  });

  it("rejects unsupported feedback methods and nested segments", () => {
    expect(() => resolveAdminEndpoint("feedback", [], "POST")).toThrow();
    expect(() => resolveAdminEndpoint("feedback", ["feedback-1"], "DELETE")).toThrow();
    expect(() => resolveAdminEndpoint("feedback", ["feedback-1", "status"], "PATCH")).toThrow();
  });

  it("rejects traversal, unsupported methods and app/student endpoint aliases", () => {
    expect(() => resolveAdminEndpoint("users", [".."], "GET")).toThrow();
    expect(() => resolveAdminEndpoint("students", [], "DELETE")).toThrow();
    expect(() => resolveAdminEndpoint("scores", ["student-1"], "GET")).toThrow();
    expect(() => resolveAdminEndpoint("timetable", ["student-1"], "GET")).toThrow();
    expect(() => resolveAdminEndpoint("homeworks", ["student-1"], "GET")).toThrow();
    expect(() => resolveAdminEndpoint("meals", [], "GET")).toThrow();
  });
});
