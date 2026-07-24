"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AdminShell, Icon } from "@/features/admin-shell";
import { listStudents } from "@/features/students/service/students.client";
import { listUsers } from "@/features/users/service/users.client";

const SUMMARY_QUERY = "?page=1&page_size=1";

export function AdminDashboard() {
  const usersQuery = useQuery({ queryKey: ["users", "dashboard-total"], queryFn: () => listUsers(SUMMARY_QUERY) });
  const studentsQuery = useQuery({ queryKey: ["students", "dashboard-total"], queryFn: () => listStudents(SUMMARY_QUERY) });

  return <AdminShell activeHref="/admin" title="Tổng quan" subtitle="Theo dõi các module đang vận hành bằng dữ liệu trực tiếp từ hệ thống.">
    <section aria-label="Chỉ số hệ thống" className="grid gap-5 md:grid-cols-2">
      <SummaryCard title="Người dùng" icon="manage_accounts" href="/admin/users" value={usersQuery.data?.total} isPending={usersQuery.isPending} isError={usersQuery.isError} errorMessage="Không thể tải số người dùng." retryLabel="Thử tải lại số người dùng" onRetry={() => void usersQuery.refetch()} />
      <SummaryCard title="Học sinh" icon="groups" href="/admin/students" value={studentsQuery.data?.total} isPending={studentsQuery.isPending} isError={studentsQuery.isError} errorMessage="Không thể tải số học sinh." retryLabel="Thử tải lại số học sinh" onRetry={() => void studentsQuery.refetch()} />
    </section>

    <section aria-labelledby="available-modules-title" className="rounded-xl border border-[var(--outline-variant)] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-[var(--primary-fixed)] text-[var(--primary)]"><Icon name="apps" /></span><div><h2 id="available-modules-title" className="text-xl font-semibold">Module đang hoạt động</h2><p className="mt-1 text-sm text-[var(--secondary)]">Chỉ hiển thị các năng lực đã kết nối API.</p></div></div>
      <ul className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Identity & Access", "Đăng nhập, phiên và phân quyền"],
          ["User Management", "Quản trị tài khoản người dùng"],
          ["Student Administration", "Quản trị hồ sơ học sinh"],
        ].map(([name, description]) => <li key={name} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-low)] p-4"><p className="font-semibold">{name}</p><p className="mt-1 text-sm text-[var(--secondary)]">{description}</p><p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#166534]"><span className="size-2 rounded-full bg-[#15803d]" />Đang hoạt động</p></li>)}
      </ul>
    </section>
  </AdminShell>;
}

type SummaryCardProps = { title: string; icon: string; href: string; value?: number; isPending: boolean; isError: boolean; errorMessage: string; retryLabel: string; onRetry: () => void };

function SummaryCard({ title, icon, href, value, isPending, isError, errorMessage, retryLabel, onRetry }: SummaryCardProps) {
  return <article className="rounded-xl border border-[var(--outline-variant)] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-md">
    <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-[var(--secondary)]">{title}</p>{!isPending && !isError ? <p className="mt-1 text-3xl font-bold leading-10 tracking-[-0.02em]">{value ?? 0}</p> : null}</div><span className="grid size-11 place-items-center rounded-lg bg-[var(--primary-fixed)] text-[var(--primary)]"><Icon name={icon} /></span></div>
    {isPending ? <div role="status" className="mt-3"><span className="sr-only">Đang tải...</span><div className="h-10 w-24 animate-pulse rounded-lg bg-[var(--surface-container)]" /></div> : null}
    {isError ? <div className="mt-3"><p role="alert" className="text-sm font-semibold text-[var(--error)]">{errorMessage}</p><button type="button" onClick={onRetry} className="mt-3 min-h-11 rounded-lg border border-[var(--outline-variant)] px-3 py-2 text-sm font-semibold hover:border-[var(--primary)] hover:text-[var(--primary)]">{retryLabel}</button></div> : null}
    <Link href={href} className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline">Mở quản lý {title.toLocaleLowerCase("vi")}<Icon name="arrow_forward" className="text-[18px]" /></Link>
  </article>;
}
