"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AdminShell } from "@/features/admin-shell";
import { useAuditLogsQuery } from "../hooks/use-system-audit";
import type { AuditLog, ListAuditLogsQuery } from "../service/system-audit.client";

const fields: Array<[keyof ListAuditLogsQuery, string, string]> = [
  ["actor_id", "Actor ID", "text"], ["action", "Hành động", "text"],
  ["bounded_context", "Bounded context", "text"], ["resource_type", "Loại tài nguyên", "text"],
  ["resource_id", "ID tài nguyên", "text"], ["from", "Từ thời điểm", "datetime-local"], ["to", "Đến thời điểm", "datetime-local"],
];

const toIso = (value?: string) => value ? new Date(value).toISOString() : undefined;

export function SystemAuditPage() {
  const { data: session } = useSession();
  const canRead = session?.user?.role === "super_admin" || (session?.user?.permissions ?? []).includes("identity.audit.read");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<ListAuditLogsQuery>({ page: 1, limit: 20 });
  const [selected, setSelected] = useState<AuditLog>();
  const query = useAuditLogsQuery(filters, { enabled: canRead });
  const pagination = query.data?.pagination;

  return <AdminShell title="Nhật ký hệ thống" subtitle="Tra cứu an toàn các thao tác quản trị." activeHref="/admin/system">
    {!canRead ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">Bạn không có quyền xem nhật ký hệ thống.</p> : <>
      <form className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(event) => { event.preventDefault(); setFilters({ page: 1, limit: 20, ...draft, from: toIso(draft.from), to: toIso(draft.to) }); }}>
        {fields.map(([key, label, type]) => <label key={key} className="text-sm font-semibold">{label}<input type={type} value={draft[key] ?? ""} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 min-h-11 w-full rounded-lg border px-3" /></label>)}
        <button type="submit" className="min-h-11 self-end rounded-lg bg-[var(--primary)] px-4 font-bold text-white">Áp dụng bộ lọc</button>
      </form>
      {query.isPending ? <p role="status" className="rounded-xl border p-6">Đang tải nhật ký...</p> : query.isError ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">Không thể tải nhật ký. <button type="button" onClick={() => void query.refetch()} className="underline">Thử lại</button></div> : !query.data?.audit_logs.length ? <p className="rounded-xl border p-6">Chưa có nhật ký phù hợp.</p> : <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left text-sm"><thead><tr><th className="p-3">Thời gian</th><th>Actor</th><th>Hành động</th><th>Tài nguyên</th><th>Chi tiết</th></tr></thead><tbody>{query.data.audit_logs.map((log) => <tr key={log.id} className="border-t"><td className="p-3">{new Date(log.created_at).toLocaleString("vi-VN")}</td><td>{log.actor_id}</td><td>{log.action}</td><td>{log.resource_type}:{log.resource_id}</td><td><button type="button" aria-label={`Xem chi tiết ${log.action}`} onClick={() => setSelected(log)} className="min-h-11 underline">Xem</button></td></tr>)}</tbody></table></div>}
      {pagination && pagination.total_pages > 1 ? <nav aria-label="Phân trang nhật ký" className="flex justify-between"><button type="button" disabled={filters.page === 1} onClick={() => setFilters((current) => ({ ...current, page: Math.max(1, (current.page ?? 1) - 1) }))}>Trang trước</button><span>Trang {pagination.page}/{pagination.total_pages}</span><button type="button" disabled={filters.page === pagination.total_pages} onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}>Trang sau</button></nav> : null}
    </>}
    {selected ? <dialog open aria-label={`Chi tiết nhật ký ${selected.action}`} className="fixed inset-0 z-50 m-auto max-h-[80vh] w-[calc(100%-2rem)] max-w-2xl overflow-auto rounded-2xl bg-white p-5 backdrop:bg-black/40"><h2 className="text-xl font-bold">{selected.action}</h2><pre className="mt-4 overflow-auto whitespace-pre-wrap">{JSON.stringify(selected.metadata ?? null, null, 2)}</pre><button type="button" autoFocus onClick={() => setSelected(undefined)} className="mt-4 min-h-11 rounded-lg border px-4">Đóng</button></dialog> : null}
  </AdminShell>;
}
