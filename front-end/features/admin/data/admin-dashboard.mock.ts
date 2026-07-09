import type {
  AdminMetric,
  AdminModule,
  AttendanceDay,
  GradeRow,
  LedgerItem,
  NavGroup,
  QueueItem,
  ScheduleItem,
  Signal,
  StudentProfile,
  SystemState,
  TimelineItem,
} from "../types/admin-dashboard.types";

export const studentProfile: StudentProfile = {
  name: "Vũ Danh Tùng",
  code: "HS-1028",
  grade: "Lớp 10A2",
  program: "Chương trình Cambridge mở rộng",
  status: "Đang theo học",
  guardian: "Nguyễn Thị Mai",
  phone: "0908 412 736",
  balance: "2.450.000đ",
  attendance: "94%",
  gpa: "8.7",
};

export const adminMetrics: AdminMetric[] = [
  {
    label: "Chuyên cần hôm nay",
    value: "96%",
    detail: "3 lớp cần xác nhận cuối buổi",
    tone: "green",
  },
  {
    label: "Hồ sơ cần duyệt",
    value: "18",
    detail: "7 hồ sơ tuyển sinh, 11 thay đổi lịch",
    tone: "blue",
  },
  {
    label: "Công nợ cần nhắc",
    value: "42",
    detail: "Tổng 128.6 triệu đồng đến hạn tuần này",
    tone: "amber",
  },
  {
    label: "Cảnh báo học tập",
    value: "9",
    detail: "Học sinh giảm điểm hoặc nghỉ liên tiếp",
    tone: "rose",
  },
];

export const adminModules: AdminModule[] = [
  {
    title: "Quản lý chuyên cần",
    description: "Điểm danh theo lớp, theo ngày và theo từng ca học.",
    metric: "12 lớp",
    label: "Cần khóa sổ",
    tone: "green",
  },
  {
    title: "Sổ điểm điện tử",
    description: "Nhập điểm, rà soát tiến độ và khóa bảng điểm học kỳ.",
    metric: "328 bài",
    label: "Chờ nhập",
    tone: "blue",
  },
  {
    title: "Học phí & Thanh toán",
    description: "Theo dõi thu chi, công nợ và lịch nhắc phụ huynh.",
    metric: "128.6tr",
    label: "Đến hạn",
    tone: "amber",
  },
  {
    title: "Xe đưa đón",
    description: "Theo dõi tuyến xe, điểm đón và danh sách học sinh trên xe.",
    metric: "6 tuyến",
    label: "Đang chạy",
    tone: "slate",
  },
  {
    title: "Nhắn tin phụ huynh",
    description: "Soạn thông báo, chọn nhóm nhận và xem lịch sử gửi.",
    metric: "1.248",
    label: "Người nhận",
    tone: "rose",
  },
  {
    title: "Lịch tuần kéo thả",
    description: "Điều phối phòng học, giáo viên và ca học trong tuần.",
    metric: "74 ca",
    label: "Tuần này",
    tone: "blue",
  },
];

export const scheduleItems: ScheduleItem[] = [
  {
    time: "07:30",
    subject: "Toán nâng cao",
    room: "A203",
    teacher: "Thầy Lê Hoàng",
    status: "Đã điểm danh",
    tone: "green",
  },
  {
    time: "09:15",
    subject: "Tiếng Anh học thuật",
    room: "B105",
    teacher: "Cô Minh Anh",
    status: "Sắp bắt đầu",
    tone: "blue",
  },
  {
    time: "13:30",
    subject: "Vật lý thực nghiệm",
    room: "Lab 2",
    teacher: "Thầy Quốc Bảo",
    status: "Cần đổi phòng",
    tone: "amber",
  },
];

export const ledgerItems: LedgerItem[] = [
  {
    label: "Học phí kỳ 2",
    value: "12.800.000đ",
    note: "Đã thanh toán 10.350.000đ",
    tone: "blue",
  },
  {
    label: "Còn phải thu",
    value: "2.450.000đ",
    note: "Hạn thanh toán 12/07/2026",
    tone: "amber",
  },
  {
    label: "Dịch vụ xe",
    value: "1.200.000đ",
    note: "Tuyến Bến Thành - Cơ sở Bắc",
    tone: "slate",
  },
];

export const gradeRows: GradeRow[] = [
  { subject: "Toán", progress: "Hoàn thành 8/10 đầu điểm", score: "8.9", status: "Ổn định" },
  { subject: "Tiếng Anh", progress: "Hoàn thành 7/10 đầu điểm", score: "8.5", status: "Cần luyện nói" },
  { subject: "Vật lý", progress: "Hoàn thành 6/10 đầu điểm", score: "7.8", status: "Theo dõi" },
];

export const attendanceDays: AttendanceDay[] = [
  { day: "T2", value: "Có", active: true },
  { day: "T3", value: "Có", active: true },
  { day: "T4", value: "Muộn" },
  { day: "T5", value: "Có", active: true },
  { day: "T6", value: "Có", active: true },
  { day: "T7", value: "Nghỉ" },
];

export const navGroups: NavGroup[] = [];
export const signals: Signal[] = [];
export const queueItems: QueueItem[] = [];
export const systemStates: SystemState[] = [];
export const timeline: TimelineItem[] = [];
