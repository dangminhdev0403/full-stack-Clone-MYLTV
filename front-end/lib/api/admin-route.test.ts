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
    expect(resolveAdminEndpoint("academic-context", ["years"], "GET")).toBe("/api/v1/admin/academic-context/years");
    expect(resolveAdminEndpoint("academic-context", ["years"], "POST")).toBe("/api/v1/admin/academic-context/years");
    expect(resolveAdminEndpoint("academic-context", ["years", "2024-2025"], "PUT")).toBe("/api/v1/admin/academic-context/years/2024-2025");
    expect(resolveAdminEndpoint("academic-context", ["years", "2024-2025"], "PATCH")).toBe("/api/v1/admin/academic-context/years/2024-2025");
    expect(resolveAdminEndpoint("academic-context", ["years", "2024-2025", "set-current"], "POST")).toBe("/api/v1/admin/academic-context/years/2024-2025/set-current");
    expect(resolveAdminEndpoint("academic-context", ["semesters"], "GET")).toBe("/api/v1/admin/academic-context/semesters");
    expect(resolveAdminEndpoint("academic-context", ["semesters"], "POST")).toBe("/api/v1/admin/academic-context/semesters");
    expect(resolveAdminEndpoint("academic-context", ["semesters", "2024-2025-sem1"], "PUT")).toBe("/api/v1/admin/academic-context/semesters/2024-2025-sem1");
    expect(resolveAdminEndpoint("academic-context", ["semesters", "2024-2025-sem1", "set-current"], "POST")).toBe("/api/v1/admin/academic-context/semesters/2024-2025-sem1/set-current");
    expect(resolveAdminEndpoint("notifications", ["notification-1"], "GET")).toBe("/api/v1/admin/notifications/notification-1");
    expect(resolveAdminEndpoint("notifications", ["notification-1"], "PATCH")).toBe("/api/v1/admin/notifications/notification-1");
    expect(resolveAdminEndpoint("academic-structure", ["grade-levels"], "GET")).toBe("/api/v1/admin/academic-structure/grade-levels");
    expect(resolveAdminEndpoint("academic-structure", ["grade-levels"], "POST")).toBe("/api/v1/admin/academic-structure/grade-levels");
    expect(resolveAdminEndpoint("academic-structure", ["grade-levels", "grade-1"], "PATCH")).toBe("/api/v1/admin/academic-structure/grade-levels/grade-1");
    expect(resolveAdminEndpoint("academic-structure", ["classes"], "GET")).toBe("/api/v1/admin/academic-structure/classes");
    expect(resolveAdminEndpoint("academic-structure", ["classes"], "POST")).toBe("/api/v1/admin/academic-structure/classes");
    expect(resolveAdminEndpoint("academic-structure", ["classes", "class-1"], "PATCH")).toBe("/api/v1/admin/academic-structure/classes/class-1");
    expect(resolveAdminEndpoint("academic-structure", ["classes", "class-1", "roster"], "GET")).toBe("/api/v1/admin/academic-structure/classes/class-1/roster");
    expect(resolveAdminEndpoint("academic-structure", ["classes", "class-1", "enrollments"], "POST")).toBe("/api/v1/admin/academic-structure/classes/class-1/enrollments");
    expect(resolveAdminEndpoint("academic-structure", ["classes", "class-1", "enrollments", "student-1", "deactivate"], "POST")).toBe("/api/v1/admin/academic-structure/classes/class-1/enrollments/student-1/deactivate");
  });

  it("allows attendance, tuition and feedback domain routes", () => {
    expect(resolveAdminEndpoint("attendance", [], "GET")).toBe("/api/v1/admin/attendance");
    expect(resolveAdminEndpoint("students", ["student-1", "attendance"], "GET")).toBe(
      "/api/v1/admin/students/student-1/attendance",
    );
    expect(resolveAdminEndpoint("students", ["student-1", "scores"], "GET")).toBe(
      "/api/v1/admin/students/student-1/scores",
    );
    expect(resolveAdminEndpoint("students", ["student-1", "bus-route"], "GET")).toBe(
      "/api/v1/admin/students/student-1/bus-route",
    );
    expect(resolveAdminEndpoint("tuition", [], "GET")).toBe("/api/v1/admin/tuition");
    expect(resolveAdminEndpoint("tuition", [], "POST")).toBe("/api/v1/admin/tuition");
    expect(resolveAdminEndpoint("tuition", ["charge-1"], "GET")).toBe("/api/v1/admin/tuition/charge-1");
    expect(resolveAdminEndpoint("tuition", ["charge-1"], "PATCH")).toBe("/api/v1/admin/tuition/charge-1");
    expect(resolveAdminEndpoint("feedback", [], "GET")).toBe("/api/v1/admin/feedback");
    expect(resolveAdminEndpoint("feedback", ["feedback-1"], "GET")).toBe("/api/v1/admin/feedback/feedback-1");
    expect(resolveAdminEndpoint("feedback", ["feedback-1"], "PATCH")).toBe("/api/v1/admin/feedback/feedback-1");
    expect(resolveAdminEndpoint("scores", [], "GET")).toBe("/api/v1/admin/scores");
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
