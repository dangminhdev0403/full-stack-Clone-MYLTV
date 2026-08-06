export type AdminRouteReadiness = "implemented" | "in_progress" | "planned";
export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
  readiness: AdminRouteReadiness;
  description: string;
  permission?: string;
};
export type AdminNavGroup = { label: string; items: readonly AdminNavItem[] };

export const adminNavGroups: readonly AdminNavGroup[] = [
  { label: "Tổng quan", items: [
    { href: "/admin", label: "Tổng quan", icon: "dashboard", readiness: "implemented", description: "Bảng điều khiển quản trị tổng hợp." },
  ] },
  { label: "Nhà trường", items: [
    { href: "/admin/users", label: "Người dùng", icon: "manage_accounts", permission: "users.manage", readiness: "implemented", description: "Quản lý tài khoản, vai trò và quyền truy cập." },
    { href: "/admin/students", label: "Học sinh", icon: "school", permission: "students.read", readiness: "implemented", description: "Quản lý hồ sơ học sinh và trạng thái học tập." },
    { href: "/admin/academic-structure", label: "Cấu trúc học tập", icon: "account_tree", permission: "academics.structure.read", readiness: "implemented", description: "Quản lý khối học, lớp học và chuyển lớp / lên lớp." },
  ] },
  { label: "Học tập", items: [
    { href: "/admin/attendance", label: "Điểm danh", icon: "fact_check", permission: "academics.attendance.read", readiness: "implemented", description: "Theo dõi điểm danh học sinh theo lớp và buổi học." },
    { href: "/admin/grades", label: "Điểm số", icon: "grade", readiness: "planned", description: "Quản lý bảng điểm, nhận xét và kết quả học tập." },
    { href: "/admin/homeworks", label: "Bài tập", icon: "assignment", readiness: "planned", description: "Giao, theo dõi và tổng hợp bài tập của học sinh." },
    { href: "/admin/timetable", label: "Thời khóa biểu", icon: "calendar_month", permission: "academics.timetable.read", readiness: "implemented", description: "Sắp xếp lịch học, phòng học và phân công giảng dạy." },
  ] },
  { label: "Dịch vụ", items: [
    { href: "/admin/tuition", label: "Học phí", icon: "payments", readiness: "implemented", permission: "billing.tuition.read", description: "Theo dõi học phí, khoản thu và tình trạng thanh toán." },
    { href: "/admin/services/meals", label: "Bữa ăn", icon: "restaurant", readiness: "planned", description: "Quản lý thực đơn, suất ăn và đăng ký bữa ăn." },
    { href: "/admin/services/events", label: "Sự kiện", icon: "event", readiness: "planned", description: "Tổ chức sự kiện, lịch hoạt động và danh sách tham gia." },
    { href: "/admin/services/surveys", label: "Khảo sát", icon: "poll", readiness: "planned", description: "Thu thập phản hồi qua khảo sát dành cho phụ huynh và học sinh." },
    { href: "/admin/services/clubs", label: "Câu lạc bộ", icon: "groups", readiness: "planned", description: "Quản lý câu lạc bộ, lịch sinh hoạt và đăng ký thành viên." },
    { href: "/admin/services/bus", label: "Xe buýt", icon: "directions_bus", readiness: "planned", description: "Theo dõi tuyến xe, điểm đón trả và đăng ký đi xe." },
    { href: "/admin/services/uniforms", label: "Đồng phục", icon: "checkroom", readiness: "planned", description: "Quản lý đồng phục, kích cỡ và đơn đăng ký cấp phát." },
  ] },
  { label: "Truyền thông", items: [
    { href: "/admin/news", label: "Tin tức", icon: "campaign", permission: "communication.news.read", readiness: "implemented", description: "Biên tập và xuất bản tin tức nhà trường." },
    { href: "/admin/notifications", label: "Thông báo", icon: "notifications", permission: "communication.notifications.read", readiness: "implemented", description: "Gửi thông báo đến phụ huynh, học sinh và nhân sự." },
  ] },
  { label: "Phản hồi", items: [
    { href: "/admin/feedback", label: "Phản hồi", icon: "forum", permission: "communication.feedback.read", readiness: "implemented", description: "Tiếp nhận và xử lý phản hồi từ cộng đồng nhà trường." },
  ] },
  { label: "Báo cáo", items: [
    { href: "/admin/reports", label: "Báo cáo", icon: "analytics", readiness: "planned", description: "Tổng hợp báo cáo vận hành, học tập và dịch vụ." },
  ] },
  { label: "Hệ thống", items: [
    { href: "/admin/system", label: "Hệ thống & Nhật ký", icon: "settings", permission: "identity.audit.read", readiness: "implemented", description: "Cấu hình hệ thống, nhật ký và thiết lập quản trị." },
  ] },
] as const;

export const adminNavItems = adminNavGroups.flatMap(({ items }) => items);
export const implementedAdminRoutes = adminNavItems.filter((item) => item.readiness === "implemented");
export const plannedAdminRoutes = adminNavItems.filter((item) => item.readiness === "planned" || item.readiness === "in_progress");

export function getAdminNavItemByHref(href: string): AdminNavItem | undefined {
  return adminNavItems.find((item) => item.href === href);
}

export function getVisibleAdminNavGroups(permissions: readonly string[], role?: string): AdminNavGroup[] {
  const canAccessAll = role === "super_admin";
  return adminNavGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.readiness !== "implemented" || canAccessAll || !item.permission || permissions.includes(item.permission)),
  })).filter((group) => group.items.length > 0);
}

export type AdminBreadcrumb = { label: string; href?: string };

export function resolveAdminBreadcrumbs(pathname: string): AdminBreadcrumb[] {
  if (pathname === "/admin") return [{ label: "Tổng quan" }];
  const item = adminNavItems.find(({ href }) => pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)));
  if (!item) return [{ href: "/admin", label: "Tổng quan" }];
  const group = adminNavGroups.find(({ items }) => items.some(({ href }) => href === item.href));
  const breadcrumbs: AdminBreadcrumb[] = [{ href: "/admin", label: "Tổng quan" }];
  if (group && group.label !== "Tổng quan") breadcrumbs.push({ label: group.label });
  if (!group || group.label !== item.label) breadcrumbs.push(pathname === item.href ? { label: item.label } : { href: item.href, label: item.label });
  if (pathname !== item.href) breadcrumbs.push({ label: item.href === "/admin/students" ? "Chi tiết học sinh" : "Chi tiết" });
  return breadcrumbs;
}
