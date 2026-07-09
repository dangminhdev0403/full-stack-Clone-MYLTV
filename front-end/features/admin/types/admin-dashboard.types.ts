export type AcademicTone = "blue" | "green" | "amber" | "rose" | "slate";

export type AdminMetric = {
  label: string;
  value: string;
  detail: string;
  tone: AcademicTone;
};

export type AdminModule = {
  title: string;
  description: string;
  metric: string;
  label: string;
  tone: AcademicTone;
};

export type StudentProfile = {
  name: string;
  code: string;
  grade: string;
  program: string;
  status: string;
  guardian: string;
  phone: string;
  balance: string;
  attendance: string;
  gpa: string;
};

export type ScheduleItem = {
  time: string;
  subject: string;
  room: string;
  teacher: string;
  status: string;
  tone: AcademicTone;
};

export type LedgerItem = {
  label: string;
  value: string;
  note: string;
  tone: AcademicTone;
};

export type GradeRow = {
  subject: string;
  progress: string;
  score: string;
  status: string;
};

export type AttendanceDay = {
  day: string;
  value: string;
  active?: boolean;
};

export type Tone = "critical" | "warning" | "success" | "info" | "neutral";

export type Priority = "Khẩn cấp" | "Cao" | "Trung bình";

export type QueueStatus = "Chưa phân công" | "Đang xử lý" | "Đang chờ";

export type NavItem = {
  label: string;
  href: string;
  count?: number;
  active?: boolean;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export type Signal = {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
  action: string;
};

export type QueueItem = {
  id: string;
  priority: Priority;
  issue: string;
  area: string;
  owner: string;
  due: string;
  status: QueueStatus;
  action: string;
};

export type TimelineItem = {
  time: string;
  title: string;
  meta: string;
  tone: Tone;
};

export type SystemState = {
  title: string;
  detail?: string;
  tone: "loading" | "empty" | "error";
};
