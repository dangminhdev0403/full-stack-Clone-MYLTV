export type AdminNavItem = {
  label: string;
  icon: string;
  href: string;
};

export const adminNavItems: AdminNavItem[] = [
  { label: "Tổng quan", icon: "dashboard", href: "/admin" },
  { label: "Bản đồ CRUD", icon: "dataset", href: "/admin/management" },
  { label: "Học sinh", icon: "groups", href: "/admin/students" },
  { label: "Tin tức", icon: "campaign", href: "/admin/news" },
  { label: "Thông báo", icon: "notifications_active", href: "/admin/notifications" },
  { label: "Chuyên cần", icon: "fact_check", href: "/admin/attendance" },
  { label: "Sổ điểm", icon: "menu_book", href: "/admin/grades" },
  { label: "Học phí", icon: "payments", href: "/admin/tuition" },
  { label: "Thời khóa biểu", icon: "calendar_month", href: "/admin/timetable" },
  { label: "Bài tập", icon: "assignment", href: "/admin/homeworks" },
  { label: "Suất ăn", icon: "restaurant", href: "/admin/services/meals" },
  { label: "Sự kiện", icon: "event", href: "/admin/services/events" },
  { label: "Khảo sát", icon: "quiz", href: "/admin/services/surveys" },
  { label: "CLB", icon: "diversity_3", href: "/admin/services/clubs" },
  { label: "Tuyến xe", icon: "directions_bus", href: "/admin/services/bus" },
  { label: "Đồng phục", icon: "checkroom", href: "/admin/services/uniforms" },
];

export type StudentRow = {
  id: string;
  name: string;
  code: string;
  className: string;
  guardian: string;
  phone: string;
  status: string;
  attendance: string;
  gpa: string;
  balance: string;
};

export const studentsMock: StudentRow[] = [
  {
    id: "vu-danh-tung",
    name: "Vũ Danh Tùng",
    code: "HS-1028",
    className: "7A0",
    guardian: "Nguyễn Thị Mai",
    phone: "0908 412 736",
    status: "Đang học",
    attendance: "94%",
    gpa: "8.7",
    balance: "2.450.000đ",
  },
  {
    id: "nguyen-minh-anh",
    name: "Nguyễn Minh Anh",
    code: "HS-1031",
    className: "7A0",
    guardian: "Trần Quốc Huy",
    phone: "0912 558 904",
    status: "Đang học",
    attendance: "98%",
    gpa: "9.1",
    balance: "0đ",
  },
  {
    id: "le-hoang-nam",
    name: "Lê Hoàng Nam",
    code: "HS-1044",
    className: "7A1",
    guardian: "Phạm Thu Hà",
    phone: "0935 782 441",
    status: "Cần theo dõi",
    attendance: "88%",
    gpa: "7.4",
    balance: "1.200.000đ",
  },
  {
    id: "pham-khanh-linh",
    name: "Phạm Khánh Linh",
    code: "HS-1052",
    className: "8B1",
    guardian: "Đỗ Minh Quân",
    phone: "0977 109 320",
    status: "Đang học",
    attendance: "96%",
    gpa: "8.4",
    balance: "0đ",
  },
  {
    id: "tran-bao-ngoc",
    name: "Trần Bảo Ngọc",
    code: "HS-1068",
    className: "8B2",
    guardian: "Võ Thanh Tú",
    phone: "0903 625 117",
    status: "Bảo lưu hồ sơ",
    attendance: "-",
    gpa: "-",
    balance: "0đ",
  },
];

export type AttendanceRow = {
  no: number;
  student: string;
  className: string;
  morning: string;
  afternoon: string;
  note: string;
};

export const attendanceMock: AttendanceRow[] = [
  { no: 1, student: "Vũ Danh Tùng", className: "7A0", morning: "Có mặt", afternoon: "Có mặt", note: "Đủ tiết" },
  { no: 2, student: "Nguyễn Minh Anh", className: "7A0", morning: "Có mặt", afternoon: "Có mặt", note: "Đủ tiết" },
  { no: 3, student: "Lê Hoàng Nam", className: "7A1", morning: "Đi muộn", afternoon: "Có mặt", note: "Muộn 12 phút" },
  { no: 4, student: "Phạm Khánh Linh", className: "8B1", morning: "Có mặt", afternoon: "Nghỉ phép", note: "Phụ huynh đã báo" },
];

export type GradebookRow = {
  no: number;
  student: string;
  className: string;
  oral: string;
  quiz: string;
  midterm: string;
  final: string;
  average: string;
};

export const gradebookMock: GradebookRow[] = [
  { no: 1, student: "Vũ Danh Tùng", className: "7A0", oral: "8.5", quiz: "9.0", midterm: "8.2", final: "8.9", average: "8.7" },
  { no: 2, student: "Nguyễn Minh Anh", className: "7A0", oral: "9.0", quiz: "9.4", midterm: "8.8", final: "9.1", average: "9.1" },
  { no: 3, student: "Lê Hoàng Nam", className: "7A1", oral: "7.0", quiz: "7.8", midterm: "7.2", final: "7.6", average: "7.4" },
  { no: 4, student: "Phạm Khánh Linh", className: "8B1", oral: "8.0", quiz: "8.4", midterm: "8.5", final: "8.6", average: "8.4" },
];

export type TuitionRow = {
  student: string;
  className: string;
  packageName: string;
  total: string;
  paid: string;
  remaining: string;
  dueDate: string;
  status: string;
};

export const tuitionMock: TuitionRow[] = [
  { student: "Vũ Danh Tùng", className: "7A0", packageName: "Học phí kỳ 2", total: "12.800.000đ", paid: "10.350.000đ", remaining: "2.450.000đ", dueDate: "12/07/2026", status: "Còn phải thu" },
  { student: "Nguyễn Minh Anh", className: "7A0", packageName: "Học phí kỳ 2", total: "12.800.000đ", paid: "12.800.000đ", remaining: "0đ", dueDate: "12/07/2026", status: "Đã thanh toán" },
  { student: "Lê Hoàng Nam", className: "7A1", packageName: "Học phí kỳ 2", total: "12.800.000đ", paid: "11.600.000đ", remaining: "1.200.000đ", dueDate: "12/07/2026", status: "Cần nhắc" },
  { student: "Phạm Khánh Linh", className: "8B1", packageName: "Dịch vụ bán trú", total: "3.200.000đ", paid: "3.200.000đ", remaining: "0đ", dueDate: "05/07/2026", status: "Đã thanh toán" },
];
