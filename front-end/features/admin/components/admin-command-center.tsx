import Link from "next/link";

const navItems = [
  { label: "Tổng quan", icon: "dashboard", href: "/admin", active: true },
  { label: "Học sinh", icon: "groups", href: "/admin/students" },
  { label: "Chuyên cần", icon: "fact_check", href: "/admin/attendance" },
  { label: "Sổ điểm", icon: "menu_book", href: "/admin/grades" },
  { label: "Học phí", icon: "payments", href: "/admin/tuition" },
];

const statCards = [
  {
    label: "Tổng học sinh",
    value: "1,250",
    caption: "So với năm học trước",
    icon: "group",
    iconClass: "bg-[#dbe1ff] text-[#004ac6]",
    valueClass: "text-[#191b23]",
    badge: "↑ 5%",
    badgeClass: "bg-green-50 text-[#166534]",
  },
  {
    label: "Chuyên cần hôm nay",
    value: "98.2%",
    caption: "Cập nhật lúc: 08:30 AM",
    icon: "how_to_reg",
    iconClass: "bg-[#d3e4fe] text-[#505f76]",
    valueClass: "text-[#166534]",
    badge: "Ổn định",
    badgeClass: "bg-green-50 text-[#166534]",
  },
  {
    label: "Học phí chưa đóng",
    value: "150tr",
    suffix: "VNĐ",
    caption: "Hạn chót: 30/09/2026",
    icon: "payments",
    iconClass: "bg-[#ffdbcd] text-[#943700]",
    valueClass: "text-[#9a3412]",
    badgeIcon: "warning",
    badgeClass: "text-[#9a3412]",
  },
  {
    label: "Phản hồi mới",
    value: "12",
    caption: "Cần xử lý ngay",
    icon: "forum",
    iconClass: "bg-[#e1e2ed] text-[#434655]",
    valueClass: "text-[#004ac6]",
    pulse: true,
  },
];

const activities = [
  {
    title: "Phản hồi mới",
    body: "Từ phụ huynh Vũ Danh Tùng (Lớp 7A0)",
    time: "2p trước",
    icon: "person",
    className: "bg-[#d0e1fb] text-[#004ac6]",
    action: "Phản hồi ngay",
  },
  {
    title: "Tin tức mới",
    body: "\"Thông báo lịch nghỉ lễ Quốc khánh\"",
    time: "1 giờ trước",
    icon: "campaign",
    className: "bg-[#dbe1ff] text-[#004ac6]",
    meta: "850 lượt xem",
  },
  {
    title: "Cảnh báo vận hành",
    body: "Xe tuyến số 05 đang bị chậm 15 phút do tắc đường.",
    time: "15p trước",
    icon: "directions_bus",
    className: "bg-[#ffdad6] text-[#ba1a1a]",
    action: "Theo dõi GPS",
    alert: true,
  },
  {
    title: "Báo cáo tuần",
    body: "Báo cáo chuyên cần tuần 2 đã sẵn sàng.",
    time: "3 giờ trước",
    icon: "analytics",
    className: "bg-[#e1e2ed] text-[#505f76]",
  },
];

const gradeBars = [
  { label: "Khối 6", paid: 140, unpaid: 20 },
  { label: "Khối 7", paid: 160, unpaid: 15 },
  { label: "Khối 8", paid: 120, unpaid: 40 },
  { label: "Khối 9", paid: 180, unpaid: 10 },
];

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined leading-none ${className}`}>{name}</span>;
}

export function AdminCommandCenter() {
  return (
    <main className="min-h-[100dvh] bg-[#f8fafc] text-[#191b23]">
      <Sidebar />
      <div className="min-h-[100dvh] lg:ml-64">
        <Topbar />
        <section className="space-y-6 p-4 sm:p-6">
          <QuickFilters />
          <StatsGrid />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <AttendanceChart />
              <TuitionChart />
            </div>
            <RecentActivities />
          </div>
        </section>
      </div>
      <button
        aria-label="Tạo mới"
        className="fixed bottom-8 right-8 z-50 grid size-14 place-items-center rounded-full bg-[#004ac6] text-white shadow-[0_12px_26px_rgba(15,23,42,0.22)] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff] active:scale-95"
      >
        <Icon name="add" className="text-[32px]" />
      </button>
    </main>
  );
}

function Sidebar() {
  return (
    <aside className="hidden fixed left-0 top-0 z-50 h-screen w-64 flex-col border-r border-[#c3c6d7] bg-white p-4 lg:flex">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#004ac6]">EduManager</h1>
        <p className="mt-1 text-xs font-medium text-[#505f76]">Hệ thống Quản lý</p>
      </div>
      <nav aria-label="Điều hướng quản trị" className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={`flex min-h-12 items-center gap-3 rounded-lg p-3 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff] active:scale-[0.98] ${
              item.active ? "bg-[#d0e1fb] text-[#54647a]" : "text-[#505f76] hover:bg-[#e1e2ed]"
            }`}
          >
            <Icon name={item.icon} className="text-[24px]" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-3 border-t border-[#c3c6d7] p-2 pt-4">
        <div className="grid size-10 place-items-center rounded-full bg-[#dbe1ff] text-sm font-bold text-[#004ac6]">QT</div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#191b23]">Quản trị hệ thống</p>
          <p className="truncate text-[11px] text-[#505f76]">Quản trị viên</p>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-4 border-b border-[#c3c6d7] bg-[#faf8ff] px-4 shadow-sm sm:px-6">
      <div className="hidden items-center gap-4 md:flex">
        <button className="flex h-9 items-center gap-2 rounded-lg border border-[#c3c6d7] bg-[#ededf9] px-3 text-sm font-medium text-[#191b23] transition hover:bg-[#e1e2ed] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]">
          <Icon name="calendar_today" className="text-[18px] text-[#004ac6]" />
          Năm học 2026-2027
          <Icon name="expand_more" className="text-[18px] text-[#505f76]" />
        </button>
        <button className="flex h-9 items-center gap-2 rounded-lg border border-[#c3c6d7] bg-[#ededf9] px-3 text-sm font-medium text-[#191b23] transition hover:bg-[#e1e2ed] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]">
          <Icon name="schedule" className="text-[18px] text-[#004ac6]" />
          Học kỳ I
          <Icon name="expand_more" className="text-[18px] text-[#505f76]" />
        </button>
      </div>
      <div className="lg:hidden">
        <h1 className="text-xl font-bold text-[#004ac6]">EduManager</h1>
      </div>
      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        <button aria-label="Thông báo" className="relative grid size-10 place-items-center rounded-full text-[#505f76] transition hover:bg-[#e1e2ed] hover:text-[#004ac6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]">
          <Icon name="notifications" />
          <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-[#faf8ff] bg-[#ba1a1a]" />
        </button>
        <button aria-label="Trợ giúp" className="grid size-10 place-items-center rounded-full text-[#505f76] transition hover:bg-[#e1e2ed] hover:text-[#004ac6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]">
          <Icon name="help" />
        </button>
        <button aria-label="Cài đặt" className="grid size-10 place-items-center rounded-full text-[#505f76] transition hover:bg-[#e1e2ed] hover:text-[#004ac6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]">
          <Icon name="settings" />
        </button>
        <div className="hidden h-8 w-px bg-[#c3c6d7] sm:block" />
        <div className="grid size-8 place-items-center rounded-full border border-[#c3c6d7] bg-[#dbe1ff] text-xs font-bold text-[#004ac6]">QT</div>
      </div>
    </header>
  );
}

function QuickFilters() {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[#c3c6d7] bg-white p-4 shadow-sm xl:flex-row xl:items-center">
      <span className="text-xs font-bold uppercase tracking-wider text-[#505f76]">Bộ lọc nhanh:</span>
      <div className="grid flex-1 gap-3 sm:grid-cols-3 xl:flex xl:flex-none">
        <select aria-label="Khối lớp" className="h-10 min-w-[140px] rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm text-[#191b23] outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#b4c5ff]">
          <option>Tất cả Khối</option>
          <option>Khối 6</option>
          <option>Khối 7</option>
          <option>Khối 8</option>
          <option>Khối 9</option>
        </select>
        <select aria-label="Cơ sở" className="h-10 min-w-[140px] rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm text-[#191b23] outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#b4c5ff]">
          <option>Cơ sở 1</option>
          <option>Cơ sở 2</option>
        </select>
        <input aria-label="Khoảng ngày" className="h-10 min-w-[220px] rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm text-[#191b23] outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#b4c5ff]" readOnly value="01/09/2026 - 30/09/2026" />
      </div>
      <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-5 text-sm font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff] active:scale-[0.98] xl:ml-auto">
        <Icon name="filter_list" className="text-[20px]" />
        Áp dụng
      </button>
    </section>
  );
}

function StatsGrid() {
  return (
    <section aria-label="Chỉ số tổng quan" className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card) => (
        <article key={card.label} className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className={`grid size-10 place-items-center rounded-lg ${card.iconClass}`}>
              <Icon name={card.icon} />
            </div>
            {card.badge ? <span className={`rounded px-2 py-0.5 text-xs font-bold ${card.badgeClass}`}>{card.badge}</span> : null}
            {card.badgeIcon ? <Icon name={card.badgeIcon} className={`text-[24px] ${card.badgeClass}`} /> : null}
            {card.pulse ? <span className="mt-1 size-3 rounded-full bg-[#004ac6]" /> : null}
          </div>
          <h2 className="text-[13px] font-medium leading-[18px] text-[#505f76]">{card.label}</h2>
          <p className={`mt-1 text-2xl font-bold leading-8 tracking-[-0.02em] ${card.valueClass}`}>
            {card.value} {card.suffix ? <span className="text-sm font-normal">{card.suffix}</span> : null}
          </p>
          <p className="mt-1 text-[11px] leading-[14px] text-[#737686]">{card.caption}</p>
        </article>
      ))}
    </section>
  );
}

function AttendanceChart() {
  return (
    <section className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold leading-7 text-[#191b23]">Tỷ lệ chuyên cần trong tuần</h2>
        <div className="flex items-center gap-4 text-xs font-medium text-[#505f76]">
          <div className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-[#004ac6]" /> Thực tế</div>
          <div className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-[#c3c6d7]" /> Chỉ tiêu</div>
        </div>
      </div>
      <div className="relative h-64 w-full">
        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 1000 300" role="img" aria-label="Biểu đồ đường tỷ lệ chuyên cần trong tuần">
          <path d="M0,250 L166,100 L333,120 L500,80 L666,110 L833,90 L1000,50" fill="none" stroke="#004ac6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          <path d="M0,250 L166,100 L333,120 L500,80 L666,110 L833,90 L1000,50 L1000,300 L0,300 Z" fill="url(#attendanceGrad)" opacity="0.1" />
          <line opacity="0.3" stroke="#737686" strokeDasharray="4" strokeWidth="1" x1="0" x2="1000" y1="120" y2="120" />
          <defs>
            <linearGradient id="attendanceGrad" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#004ac6" stopOpacity="1" />
              <stop offset="100%" stopColor="#004ac6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <div className="mt-4 flex justify-between text-[11px] text-[#505f76]">
          {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'].map((day) => <span key={day}>{day}</span>)}
        </div>
      </div>
    </section>
  );
}

function TuitionChart() {
  return (
    <section className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold leading-7 text-[#191b23]">Tình hình học phí theo khối</h2>
        <button className="text-sm font-bold text-[#004ac6] hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]">Chi tiết báo cáo</button>
      </div>
      <div className="flex h-64 items-end justify-around gap-4 px-4">
        {gradeBars.map((bar) => (
          <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-col justify-end gap-0.5">
              <div className="w-full rounded-t-sm bg-[#2563eb]" style={{ height: `${bar.paid}px` }} />
              <div className="w-full rounded-b-sm bg-[#ffdbcd]" style={{ height: `${bar.unpaid}px` }} />
            </div>
            <span className="text-xs font-medium text-[#505f76]">{bar.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-6 border-t border-[#c3c6d7] pt-4">
        <div className="flex items-center gap-2 text-xs"><span className="size-3 rounded-full bg-[#2563eb]" /> Đã thu</div>
        <div className="flex items-center gap-2 text-xs"><span className="size-3 rounded-full bg-[#ffdbcd]" /> Còn thiếu</div>
      </div>
    </section>
  );
}

function RecentActivities() {
  return (
    <aside className="relative overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#c3c6d7] p-6">
        <h2 className="text-xl font-semibold leading-7 text-[#191b23]">Hoạt động gần đây</h2>
        <button aria-label="Tùy chọn hoạt động" className="grid size-8 place-items-center rounded-full transition hover:bg-[#e1e2ed] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]">
          <Icon name="more_vert" />
        </button>
      </div>
      <div className="space-y-4 p-4 pb-20">
        {activities.map((activity) => (
          <article key={activity.title} className={`group flex gap-4 rounded-lg p-3 transition-colors hover:bg-[#f3f3fe] ${activity.alert ? "border-l-4 border-[#ba1a1a]" : ""}`}>
            <div className={`grid size-10 shrink-0 place-items-center rounded-full ${activity.className}`}>
              <Icon name={activity.icon} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className={`text-sm font-bold ${activity.alert ? "text-[#ba1a1a]" : "text-[#191b23]"}`}>{activity.title}</p>
                <span className="shrink-0 text-[11px] text-[#505f76]">{activity.time}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#505f76]">{activity.body}</p>
              {activity.action ? (
                <button className={`mt-2 rounded-lg px-2 py-1 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff] ${activity.alert ? "border border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffdad6]" : "text-[#004ac6] hover:bg-[#dbe1ff]"}`}>
                  {activity.action}
                </button>
              ) : null}
              {activity.meta ? <p className="mt-1 flex items-center gap-1 text-xs text-[#004ac6]"><Icon name="visibility" className="text-[14px]" /> {activity.meta}</p> : null}
            </div>
          </article>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-[#f3f3fe] p-4">
        <button className="w-full rounded-lg border border-[#737686] bg-white py-2 text-sm font-bold text-[#505f76] transition hover:bg-[#faf8ff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]">
          Xem tất cả hoạt động
        </button>
      </div>
    </aside>
  );
}
