"use client";

import { useState } from "react";
import { AdminShell, Icon } from "@/features/admin-shell";
import { useCreateNotificationMutation, useNotificationsQuery, useUpdateNotificationMutation } from "../hooks/use-notifications";
import type { NotificationItem } from "../service/notifications.client";

const emptyForm = { title: "", sender: "Ban giám hiệu", content: "", tag: "Quan trong" };

export function NotificationsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<NotificationItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState("");
  const params = new URLSearchParams({ page: String(page), page_size: "10" });
  if (query) params.set("q", query);
  if (tag) params.set("tag", tag);
  const notificationsQuery = useNotificationsQuery(`?${params.toString()}`);
  const createMutation = useCreateNotificationMutation();
  const updateMutation = useUpdateNotificationMutation();
  const items = notificationsQuery.data?.items ?? [];
  const tagCount = new Set(items.map((item) => item.tag)).size;
  const latestSentAt = items.reduce<string | null>((latest, item) => !latest || item.sent_at > latest ? item.sent_at : latest, null);

  function openCreate() { setEditing(null); setForm(emptyForm); setShowForm(true); }
  function openEdit(item: NotificationItem) { setEditing(item); setForm({ title: item.title, sender: item.sender, content: item.content, tag: item.tag }); setShowForm(true); }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const onSuccess = () => { setFeedback(editing ? "Đã cập nhật thông báo." : "Đã phát hành thông báo."); setShowForm(false); };
    if (editing) updateMutation.mutate({ id: editing.id, payload: form }, { onSuccess });
    else createMutation.mutate(form, { onSuccess });
  }

  return <AdminShell title="Thông báo" subtitle="Quản lý thông báo nhà trường qua BFF admin." activeHref="/admin/notifications">
    <section className="rounded-2xl bg-[var(--primary)] p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-widest text-white/70">Communication · Notifications</p><h2 className="mt-2 text-2xl font-black">Thông báo nhà trường</h2></div>
      <button type="button" onClick={openCreate} className="rounded-lg bg-white px-5 py-2.5 font-bold text-[var(--primary)]"><Icon name="add_alert" /> Tạo thông báo mới</button></div>
    </section>

    {notificationsQuery.data ? <section aria-label="Nhịp phát hành thông báo" className="flex flex-col gap-4 rounded-2xl border border-[var(--outline-variant)] bg-white p-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-3xl font-black">{notificationsQuery.data.total} đã phát hành</p><p className="text-sm text-[var(--secondary)]">Theo bộ lọc hiện tại</p></div><div className="flex flex-wrap gap-4 text-sm font-bold"><span>{tagCount} nhóm nội dung trên trang</span><span>{latestSentAt ? `Mới nhất ${new Intl.DateTimeFormat("vi-VN").format(new Date(latestSentAt))}` : "Chưa có lần phát hành"}</span></div></section> : null}

    <form onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(searchInput.trim()); }} className="flex flex-wrap gap-3 rounded-2xl border bg-white p-4">
      <input aria-label="Tìm thông báo" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Tìm tiêu đề hoặc nội dung" className="min-w-64 flex-1 rounded-lg border p-2.5" />
      <select aria-label="Lọc phân loại" value={tag} onChange={(event) => { setPage(1); setTag(event.target.value); }} className="rounded-lg border p-2.5"><option value="">Tất cả phân loại</option><option value="Quan trong">Quan trọng</option><option value="Hoc tap">Học tập</option><option value="Dich vu">Dịch vụ</option><option value="Su kien">Sự kiện</option></select>
      <button type="submit" className="rounded-lg bg-slate-900 px-5 py-2.5 font-bold text-white">Tìm kiếm</button>
    </form>

    {feedback ? <p role="status" className="rounded-lg bg-emerald-50 p-3 text-emerald-800">{feedback}</p> : null}
    {notificationsQuery.isPending ? <p role="status" className="rounded-2xl border bg-white p-8 text-center">Đang tải thông báo...</p>
      : notificationsQuery.isError ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"><p>Không thể tải thông báo.</p><button type="button" onClick={() => void notificationsQuery.refetch()}>Thử tải lại</button></div>
      : notificationsQuery.data?.items.length === 0 ? <p className="rounded-2xl border bg-white p-8 text-center">Chưa có thông báo phù hợp.</p>
      : <section aria-label="Danh sách thông báo" className="grid gap-4">{notificationsQuery.data?.items.map((item) => <article key={item.id} className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{item.tag}</span><h3 className="mt-2 text-lg font-bold">{item.title}</h3></div><button type="button" onClick={() => openEdit(item)} aria-label={`Sửa ${item.title}`} className="rounded-lg border px-3 py-2">Sửa</button></div><p className="mt-3 text-sm text-[var(--secondary)]">{item.content}</p><p className="mt-3 border-t pt-3 text-xs">Người gửi: <strong>{item.sender}</strong></p></article>)}</section>}

    {notificationsQuery.data && notificationsQuery.data.total > notificationsQuery.data.page_size ? <nav aria-label="Phân trang thông báo" className="flex justify-end gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Trang trước</button><span>Trang {page}</span><button type="button" disabled={!notificationsQuery.data.has_next} onClick={() => setPage((value) => value + 1)}>Trang sau</button></nav> : null}

    {showForm ? <div role="dialog" aria-modal="true" aria-labelledby="notification-form-title" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6"><h2 id="notification-form-title" className="text-xl font-bold">{editing ? "Chỉnh sửa thông báo" : "Tạo thông báo"}</h2><form onSubmit={submit} className="mt-4 space-y-4"><label className="block">Tiêu đề thông báo<input aria-label="Tiêu đề thông báo" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5" /></label><label className="block">Người gửi<input required value={form.sender} onChange={(event) => setForm({ ...form, sender: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5" /></label><label className="block">Nội dung<textarea required value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} className="mt-1 w-full rounded-lg border p-2.5" /></label><div className="flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)}>Hủy</button><button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-lg bg-[var(--primary)] px-5 py-2 text-white">{editing ? "Lưu thay đổi" : "Phát hành"}</button></div></form></div></div> : null}
  </AdminShell>;
}
