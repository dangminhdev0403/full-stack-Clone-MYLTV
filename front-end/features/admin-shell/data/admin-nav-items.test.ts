import { describe, expect, it } from "vitest";
import {
  adminNavGroups,
  adminNavItems,
  getAdminNavItemByHref,
  getVisibleAdminNavGroups,
  implementedAdminRoutes,
  plannedAdminRoutes,
  resolveAdminBreadcrumbs,
  type AdminRouteReadiness,
} from "./admin-nav-items";

const expectedIa = [
  { label: "Tổng quan", items: ["Tổng quan"] },
  { label: "Nhà trường", items: ["Người dùng", "Học sinh"] },
  {
    label: "Học tập",
    items: ["Điểm danh", "Điểm số", "Bài tập", "Thời khóa biểu"],
  },
  {
    label: "Dịch vụ",
    items: [
      "Học phí",
      "Bữa ăn",
      "Sự kiện",
      "Khảo sát",
      "Câu lạc bộ",
      "Xe buýt",
      "Đồng phục",
    ],
  },
  { label: "Truyền thông", items: ["Tin tức", "Thông báo"] },
  { label: "Phản hồi", items: ["Phản hồi"] },
  { label: "Báo cáo", items: ["Báo cáo"] },
  { label: "Hệ thống", items: ["Hệ thống"] },
];

const expectedImplemented = [
  "/admin",
  "/admin/users",
  "/admin/students",
  "/admin/attendance",
  "/admin/tuition",
  "/admin/news",
  "/admin/notifications",
  "/admin/feedback",
];
const expectedUnavailable = [
  "/admin/grades",
  "/admin/homeworks",
  "/admin/timetable",
  "/admin/services/meals",
  "/admin/services/events",
  "/admin/services/surveys",
  "/admin/services/clubs",
  "/admin/services/bus",
  "/admin/services/uniforms",
  "/admin/reports",
  "/admin/system",
];

describe("admin shell navigation metadata", () => {
  it("exposes the full EduManager information architecture in stable groups", () => {
    expect(
      adminNavGroups.map((group) => ({
        label: group.label,
        items: group.items.map((item) => item.label),
      })),
    ).toEqual(expectedIa);
  });

  it("centralizes route readiness metadata and only allows known statuses", () => {
    const allowed = new Set<AdminRouteReadiness>([
      "implemented",
      "in_progress",
      "planned",
    ]);

    expect(adminNavItems.every((item) => allowed.has(item.readiness))).toBe(
      true,
    );
    expect(implementedAdminRoutes.map((item) => item.href)).toEqual(
      expectedImplemented,
    );
    expect(plannedAdminRoutes.map((item) => item.href)).toEqual(
      expectedUnavailable,
    );
    expect(
      plannedAdminRoutes.every((item) => item.description.length > 12),
    ).toBe(true);
  });

  it("keeps planned IA visible to non-super-admin actors without inventing permissions", () => {
    const groups = getVisibleAdminNavGroups(["students.read"], "admin");

    expect(
      groups.flatMap(({ items }) => items.map(({ label }) => label)),
    ).toEqual([
      "Tổng quan",
      "Học sinh",
      "Điểm số",
      "Bài tập",
      "Thời khóa biểu",
      "Bữa ăn",
      "Sự kiện",
      "Khảo sát",
      "Câu lạc bộ",
      "Xe buýt",
      "Đồng phục",
      "Báo cáo",
      "Hệ thống",
    ]);
    expect(
      getVisibleAdminNavGroups(
        ["students.read", "billing.tuition.read"],
        "admin",
      )
        .flatMap(({ items }) => items)
        .some(({ label }) => label === "Học phí"),
    ).toBe(true);
    expect(
      getVisibleAdminNavGroups(
        ["students.read", "communication.notifications.read"],
        "admin",
      )
        .flatMap(({ items }) => items)
        .some(({ label }) => label === "Thông báo"),
    ).toBe(true);
    expect(
      getVisibleAdminNavGroups([], "super_admin").flatMap(({ items }) => items),
    ).toHaveLength(19);
  });

  it("builds breadcrumbs from exact, dynamic and nested planned admin routes", () => {
    expect(resolveAdminBreadcrumbs("/admin/news")).toEqual([
      { href: "/admin", label: "Tổng quan" },
      { label: "Truyền thông" },
      { label: "Tin tức" },
    ]);
    expect(resolveAdminBreadcrumbs("/admin/students/student-1")).toEqual([
      { href: "/admin", label: "Tổng quan" },
      { label: "Nhà trường" },
      { href: "/admin/students", label: "Học sinh" },
      { label: "Chi tiết học sinh" },
    ]);
    expect(resolveAdminBreadcrumbs("/admin/services/meals")).toEqual([
      { href: "/admin", label: "Tổng quan" },
      { label: "Dịch vụ" },
      { label: "Bữa ăn" },
    ]);
    expect(resolveAdminBreadcrumbs("/admin/reports")).toEqual([
      { href: "/admin", label: "Tổng quan" },
      { label: "Báo cáo" },
    ]);
  });

  it("requires communication feedback read permission for implemented feedback nav", () => {
    expect(getAdminNavItemByHref("/admin/feedback")).toMatchObject({
      readiness: "implemented",
      permission: "communication.feedback.read",
    });
    expect(
      getVisibleAdminNavGroups([], "admin")
        .flatMap(({ items }) => items)
        .some(({ href }) => href === "/admin/feedback"),
    ).toBe(false);
    expect(
      getVisibleAdminNavGroups(["communication.feedback.read"], "admin")
        .flatMap(({ items }) => items)
        .some(({ href }) => href === "/admin/feedback"),
    ).toBe(true);
  });

  it("resolves nav metadata for every unavailable route", () => {
    expect(
      expectedUnavailable.map((href) => getAdminNavItemByHref(href)?.readiness),
    ).toEqual(expectedUnavailable.map(() => "planned"));
  });
});
