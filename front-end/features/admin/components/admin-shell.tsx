import Link from "next/link";
import { adminNavItems } from "../data/admin-pages.mock";

export function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined leading-none ${className}`}>{name}</span>;
}

export function AdminShell({
  activeHref,
  title,
  subtitle,
  children,
}: {
  activeHref: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-[100dvh] bg-[#f8fafc] text-[#191b23]">
      <Sidebar activeHref={activeHref} />
      <div className="min-h-[100dvh] lg:ml-64">
        <Topbar />
        <section className="space-y-6 p-4 sm:p-6">
          <div className="flex flex-col gap-3 rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
            <div>
              <nav aria-label="Đường dẫn" className="mb-2 flex items-center gap-2 text-sm font-medium text-[#505f76]">
                <Link className="hover:text-[#004ac6]" href="/admin">Tổng quan</Link>
                {activeHref !== "/admin" ? (
                  <>
                    <Icon name="chevron_right" className="text-[16px]" />
                    <span className="text-[#004ac6]">{title}</span>
                  </>
                ) : null}
              </nav>
              <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#191b23] sm:text-3xl">{title}</h1>
              {subtitle ? <p className="mt-2 max-w-[70ch] text-sm leading-6 text-[#505f76]">{subtitle}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#c3c6d7] bg-[#ededf9] px-4 text-sm font-bold text-[#191b23] transition hover:bg-[#e1e2ed] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff] active:scale-[0.98]">
                <Icon name="download" className="text-[18px]" />
                Xuất dữ liệu
              </button>
              <button className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-4 text-sm font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff] active:scale-[0.98]">
                <Icon name="add" className="text-[18px]" />
                Tạo mới
              </button>
            </div>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}

function Sidebar({ activeHref }: { activeHref: string }) {
  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-[#c3c6d7] bg-white p-4 lg:flex">
      <div className="mb-8 px-2">
        <Link href="/admin" className="block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]">
          <p className="text-2xl font-bold tracking-[-0.02em] text-[#004ac6]">EduManager</p>
          <p className="mt-1 text-xs font-medium text-[#505f76]">Hệ thống Quản lý</p>
        </Link>
      </div>
      <nav aria-label="Điều hướng quản trị" className="flex-1 space-y-1 overflow-y-auto pr-1">
        {adminNavItems.map((item) => {
          const active = activeHref === item.href || (item.href !== "/admin" && activeHref.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-lg p-3 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff] active:scale-[0.98] ${
                active ? "bg-[#d0e1fb] text-[#004ac6]" : "text-[#505f76] hover:bg-[#e1e2ed]"
              }`}
            >
              <Icon name={item.icon} className="text-[24px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
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
        <Link href="/admin" className="text-xl font-bold text-[#004ac6]">EduManager</Link>
      </div>
      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-bold text-[#505f76] transition hover:bg-[#e1e2ed] hover:text-[#004ac6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]">
          Đăng xuất
        </Link>
        <button aria-label="Thông báo" className="relative grid size-10 place-items-center rounded-full text-[#505f76] transition hover:bg-[#e1e2ed] hover:text-[#004ac6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]">
          <Icon name="notifications" />
          <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-[#faf8ff] bg-[#ba1a1a]" />
        </button>
        <div className="hidden h-8 w-px bg-[#c3c6d7] sm:block" />
        <div className="grid size-8 place-items-center rounded-full border border-[#c3c6d7] bg-[#dbe1ff] text-xs font-bold text-[#004ac6]">QT</div>
      </div>
    </header>
  );
}
