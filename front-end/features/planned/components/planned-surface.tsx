import Link from "next/link";
import { AdminShell, Icon } from "@/features/admin-shell";
import { getAdminNavItemByHref } from "@/features/admin-shell/data/admin-nav-items";

export function PlannedSurface({ title, activeHref, description }: { title: string; activeHref: string; description?: string }) {
  const navItem = getAdminNavItemByHref(activeHref);
  const moduleDescription = description ?? navItem?.description ?? "Module đã có trong lộ trình sản phẩm và sẽ được kích hoạt khi backend sẵn sàng.";

  return <AdminShell activeHref={activeHref} title={title} subtitle={moduleDescription}>
    <section className="overflow-hidden rounded-2xl border border-[var(--outline-variant)] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="bg-gradient-to-br from-[var(--primary)] via-[#2563eb] to-[#0f172a] p-6 text-white sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/90 ring-1 ring-white/25">
              <Icon name="construction" className="text-[18px]" /> Đang phát triển
            </span>
            <h2 className="mt-5 text-2xl font-bold tracking-[-0.02em] sm:text-3xl">Tính năng đang hoàn thiện</h2>
            <p className="mt-3 text-sm leading-6 text-white/85 sm:text-base">{moduleDescription}</p>
          </div>
          <Link href="/admin" aria-label="Quay về Tổng quan" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[var(--primary)] shadow-sm transition hover:bg-blue-50">
            <Icon name="arrow_back" className="text-[18px]" /> Quay về Tổng quan
          </Link>
        </div>
      </div>
      <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
        <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-low)] p-4">
          <p className="text-sm font-bold text-[var(--foreground)]">Không gọi API chưa sẵn sàng</p>
          <p className="mt-2 text-sm leading-6 text-[var(--secondary)]">Trang này không mount query, mutation hoặc client của module chưa có contract implemented.</p>
        </div>
        <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-low)] p-4">
          <p className="text-sm font-bold text-[var(--foreground)]">Giữ đúng định hướng sản phẩm</p>
          <p className="mt-2 text-sm leading-6 text-[var(--secondary)]">Sidebar, active navigation và breadcrumb vẫn phản ánh đầy đủ IA EduManager.</p>
        </div>
        <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-low)] p-4">
          <p className="text-sm font-bold text-[var(--foreground)]">Sẵn sàng kích hoạt</p>
          <p className="mt-2 text-sm leading-6 text-[var(--secondary)]">Khi backend, contract và frontend client hoàn tất, route sẽ chuyển sang màn hình nghiệp vụ thật.</p>
        </div>
      </div>
    </section>
  </AdminShell>;
}
