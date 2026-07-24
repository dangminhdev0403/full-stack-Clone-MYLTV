"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminShell, Icon } from "@/features/admin-shell";
import { ApiClientError } from "@/lib/api/schemas";
import { type Student } from "../service/students.client";
import { useStudentsQuery, useUpdateStudentMutation } from "../hooks/use-students";

const PAGE_SIZE = 20;
const grades = Array.from({ length: 12 }, (_, index) => String(index + 1));

type Filters = { q: string; grade: string; className: string; active: string };
const emptyFilters: Filters = { q: "", grade: "", className: "", active: "" };

export function StudentsPage() {
  const { data: session } = useSession();
  const [statusTarget, setStatusTarget] = useState<Student | null>(null);
  const canManage = session?.user?.role === "super_admin" || session?.user?.permissions?.includes("students.manage");
  const updateMutation = useUpdateStudentMutation();
  const statusMutation = {
    ...updateMutation,
    mutate: (student: Student) =>
      updateMutation.mutate(
        { id: student.id, payload: { is_active: !student.is_active } },
        { onSuccess: () => setStatusTarget(null) },
      ),
  };
  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [page, setPage] = useState(1);
  const query = buildQuery(filters, page);
  const studentsQuery = useStudentsQuery(query, {
    placeholderData: (previous) => previous,
  });
  const students = studentsQuery.data?.items ?? [];
  const error = errorMessage(studentsQuery.error);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setFilters({ ...draft, q: draft.q.trim(), className: draft.className.trim() });
  }

  return <AdminShell activeHref="/admin/students" title="Quản lý học sinh" subtitle="Tra cứu hồ sơ và trạng thái học sinh từ Student Administration API.">
    <form onSubmit={applyFilters} aria-label="Bộ lọc học sinh" className="rounded-xl border border-[var(--outline-variant)] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(240px,2fr)_1fr_1fr_1fr_auto] xl:items-end">
        <label className="grid gap-1.5 text-xs font-semibold text-[var(--secondary)] sm:col-span-2 xl:col-span-1">Tìm kiếm
          <span className="relative"><Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[var(--outline)]" /><input type="search" aria-label="Tìm kiếm học sinh" value={draft.q} onChange={(event) => setDraft((value) => ({ ...value, q: event.target.value }))} placeholder="Tên hoặc mã học sinh..." className="min-h-11 w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-low)] py-2 pl-10 pr-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100" /></span>
        </label>
        <FilterSelect label="Lọc theo khối" value={draft.grade} onChange={(grade) => setDraft((value) => ({ ...value, grade }))}><option value="">Tất cả khối</option>{grades.map((grade) => <option key={grade} value={grade}>Khối {grade}</option>)}</FilterSelect>
        <label className="grid gap-1.5 text-xs font-semibold text-[var(--secondary)]">Lớp<input aria-label="Lọc theo lớp" value={draft.className} onChange={(event) => setDraft((value) => ({ ...value, className: event.target.value }))} placeholder="Ví dụ: 10A1" className="min-h-11 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-low)] px-3 text-sm font-normal text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100" /></label>
        <FilterSelect label="Lọc theo trạng thái" value={draft.active} onChange={(active) => setDraft((value) => ({ ...value, active }))}><option value="">Tất cả trạng thái</option><option value="true">Đang học</option><option value="false">Ngừng học</option></FilterSelect>
        <button type="submit" aria-label="Áp dụng bộ lọc" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#003ea8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"><Icon name="filter_list" className="text-[20px]" />Lọc</button>
      </div>
    </form>

    {error ? <ErrorState message={error} onRetry={() => void studentsQuery.refetch()} /> : null}
    {studentsQuery.isPending ? <LoadingState /> : null}
    {!studentsQuery.isPending && !error && students.length === 0 ? <EmptyState filtered={Object.values(filters).some(Boolean)} /> : null}
    {!error && students.length > 0 ? <StudentTable students={students} canManage={Boolean(canManage)} onStatus={setStatusTarget} /> : null}
    {statusTarget ? <StatusConfirm student={statusTarget} pending={statusMutation.isPending} close={() => setStatusTarget(null)} confirm={() => statusMutation.mutate(statusTarget)} /> : null}
    {!studentsQuery.isPending && !error && studentsQuery.data ? <Pagination page={studentsQuery.data.page} pageSize={studentsQuery.data.page_size} total={studentsQuery.data.total} hasNext={studentsQuery.data.has_next} loading={studentsQuery.isFetching} onPage={setPage} /> : null}
  </AdminShell>;
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-xs font-semibold text-[var(--secondary)]">{label}<select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-low)] px-3 text-sm font-normal text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100">{children}</select></label>;
}

function StudentTable({ students, canManage, onStatus }: { students: Student[]; canManage: boolean; onStatus: (student: Student) => void }) {
  return <section aria-label="Danh sách học sinh" className="overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
    <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left text-sm">
      <thead className="border-b border-[var(--outline-variant)] bg-[var(--surface-low)] text-xs font-semibold uppercase tracking-wide text-[var(--secondary)]"><tr><th className="px-4 py-3">Học sinh</th><th className="px-4 py-3">Mã HS</th><th className="px-4 py-3">Lớp</th><th className="px-4 py-3">Khối</th><th className="px-4 py-3">Trường</th><th className="px-4 py-3 text-center">Trạng thái</th><th className="px-4 py-3 text-right">Thao tác</th></tr></thead>
      <tbody className="divide-y divide-[var(--outline-variant)]">{students.map((student) => <tr key={student.id} className="transition-colors hover:bg-blue-50/50">
        <td className="px-4 py-3"><div className="flex items-center gap-3">{student.avatar_url ? <Image src={student.avatar_url} alt={`Ảnh ${student.full_name}`} width={40} height={40} unoptimized className="size-10 rounded-lg object-cover" /> : <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--primary-fixed)] font-bold text-[var(--primary)]">{initials(student.full_name)}</span>}<span className="font-semibold text-[var(--foreground)]">{student.full_name}</span></div></td>
        <td className="px-4 py-3 font-medium text-[var(--secondary)]">{student.code}</td><td className="px-4 py-3"><span className="inline-flex rounded-full bg-[var(--surface-container)] px-2.5 py-1 font-semibold">{student.class_name}</span></td><td className="px-4 py-3 text-[var(--secondary)]">{student.grade ?? "—"}</td><td className="max-w-52 truncate px-4 py-3 text-[var(--secondary)]">{student.school_name}</td><td className="px-4 py-3 text-center"><StatusBadge active={student.is_active} /></td>
        <td className="px-4 py-3 text-right"><div className="inline-flex items-center gap-1"><Link href={`/admin/students/${student.id}`} aria-label={`Xem hồ sơ ${student.full_name}`} title="Xem chi tiết" className="inline-grid size-11 place-items-center rounded-lg text-[var(--secondary)] hover:bg-[var(--secondary-container)]"><Icon name="visibility" className="text-[20px]" /></Link>{canManage ? <><Link href={`/admin/students/${student.id}?edit=1`} aria-label={`Chỉnh sửa ${student.full_name}`} className="inline-grid size-11 place-items-center rounded-lg text-[var(--primary)] hover:bg-[var(--secondary-container)]"><Icon name="edit" className="text-[20px]" /></Link><button type="button" onClick={() => onStatus(student)} aria-label={`${student.is_active ? "Ngừng học" : "Kích hoạt lại"} ${student.full_name}`} className="inline-grid size-11 place-items-center rounded-lg text-[var(--secondary)] hover:bg-[var(--surface-container)]"><Icon name={student.is_active ? "lock" : "lock_open"} className="text-[20px]" /></button></> : null}</div></td>
      </tr>)}</tbody>
    </table></div>
  </section>;
}

function StatusConfirm({ student, pending, close, confirm }: { student: Student; pending: boolean; close: () => void; confirm: () => void }) { return <div role="dialog" aria-modal="true" aria-labelledby="list-status-title" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6"><h2 id="list-status-title" className="text-xl font-bold">{student.is_active ? "Xác nhận ngừng học" : "Xác nhận kích hoạt lại"}</h2><p className="mt-3 text-sm text-[var(--secondary)]">Cập nhật trạng thái của {student.full_name}.</p><div className="mt-6 flex justify-end gap-3"><button onClick={close} className="min-h-11 rounded-lg border px-4 font-semibold">Hủy</button><button disabled={pending} onClick={confirm} className="min-h-11 rounded-lg bg-[var(--primary)] px-4 font-bold text-white">Xác nhận</button></div></div></div>; }

function StatusBadge({ active }: { active: boolean }) { return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}><span className={`size-1.5 rounded-full ${active ? "bg-emerald-600" : "bg-slate-500"}`} />{active ? "Đang học" : "Ngừng học"}</span>; }

function Pagination({ page, pageSize, total, hasNext, loading, onPage }: { page: number; pageSize: number; total: number; hasNext: boolean; loading: boolean; onPage: (page: number) => void }) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return <nav aria-label="Phân trang học sinh" className="flex flex-col gap-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-low)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-[var(--secondary)]">Hiển thị <strong className="text-[var(--foreground)]">{start}–{end}</strong> trong tổng số <strong className="text-[var(--foreground)]">{total}</strong> học sinh</p><div className="flex items-center gap-2"><button type="button" aria-label="Trang trước" disabled={page <= 1 || loading} onClick={() => onPage(page - 1)} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[var(--outline-variant)] bg-white px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"><Icon name="chevron_left" />Trước</button><span className="min-w-10 text-center text-sm font-semibold">{page}</span><button type="button" aria-label="Trang sau" disabled={!hasNext || loading} onClick={() => onPage(page + 1)} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[var(--outline-variant)] bg-white px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">Sau<Icon name="chevron_right" /></button></div></nav>;
}

function LoadingState() { return <section role="status" aria-label="Đang tải danh sách học sinh" className="overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-white"><span className="sr-only">Đang tải danh sách học sinh</span>{Array.from({ length: 5 }, (_, index) => <div key={index} className="flex animate-pulse items-center gap-4 border-b border-[var(--outline-variant)] p-4 last:border-0"><span className="size-10 rounded-lg bg-[var(--surface-container)]" /><span className="h-4 w-48 rounded bg-[var(--surface-container)]" /></div>)}</section>; }
function EmptyState({ filtered }: { filtered: boolean }) { return <section role="status" aria-label="Danh sách học sinh trống" className="rounded-xl border border-[var(--outline-variant)] bg-white px-6 py-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.05)]"><span className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--primary-fixed)] text-[var(--primary)]"><Icon name="person_search" /></span><h2 className="mt-4 text-xl font-semibold">{filtered ? "Không tìm thấy học sinh" : "Chưa có học sinh"}</h2><p className="mt-2 text-sm text-[var(--secondary)]">{filtered ? "Hãy điều chỉnh từ khóa hoặc bộ lọc để xem kết quả khác." : "Danh sách học sinh hiện đang trống."}</p></section>; }
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) { return <section role="alert" className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><Icon name="error" /><div><h2 className="font-semibold">Không thể tải danh sách</h2><p className="mt-1 text-sm">{message}</p></div></div><button type="button" onClick={onRetry} className="min-h-10 rounded-lg border border-red-300 bg-white px-4 text-sm font-semibold">Thử lại</button></section>; }

function buildQuery(filters: Filters, page: number) { const params = new URLSearchParams(); if (filters.q) params.set("q", filters.q); if (filters.grade) params.set("grade", filters.grade); if (filters.className) params.set("class_name", filters.className); if (filters.active) params.set("is_active", filters.active); params.set("page", String(page)); params.set("page_size", String(PAGE_SIZE)); return `?${params.toString()}`; }
function initials(name: string) { return name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join("").toUpperCase(); }
function errorMessage(error: unknown) { if (!error) return ""; if (error instanceof ApiClientError) return error.status === 403 ? "Bạn không có quyền xem danh sách học sinh." : `${error.message}${error.requestId ? ` (${error.requestId})` : ""}`; return "Không thể kết nối dịch vụ học sinh."; }
