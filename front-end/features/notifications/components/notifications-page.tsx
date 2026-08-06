"use client";

import { useState } from "react";
import { AdminShell, Icon } from "@/features/admin-shell";
import {
  useCreateNotificationMutation,
  useNotificationsQuery,
  useUpdateNotificationMutation,
} from "../hooks/use-notifications";
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
  const latestSentAt = items.reduce<string | null>(
    (latest, item) => (!latest || item.sent_at > latest ? item.sent_at : latest),
    null
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(item: NotificationItem) {
    setEditing(item);
    setForm({ title: item.title, sender: item.sender, content: item.content, tag: item.tag });
    setShowForm(true);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const onSuccess = () => {
      setFeedback(editing ? "Đã cập nhật thông báo thành công." : "Đã phát hành thông báo thành công.");
      setShowForm(false);
    };
    if (editing) updateMutation.mutate({ id: editing.id, payload: form }, { onSuccess });
    else createMutation.mutate(form, { onSuccess });
  }

  function getTagStyle(tagValue: string) {
    const t = tagValue.toLowerCase();
    if (t.includes("học phí") || t.includes("hoc phi") || t.includes("dich vu")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    }
    if (t.includes("quan trong") || t.includes("khẩn")) {
      return "bg-rose-50 text-rose-700 border-rose-200/80";
    }
    if (t.includes("hoc tap") || t.includes("học tập")) {
      return "bg-blue-50 text-blue-700 border-blue-200/80";
    }
    return "bg-purple-50 text-purple-700 border-purple-200/80";
  }

  return (
    <AdminShell
      title="Thông báo"
      subtitle="Quản lý thông báo nhà trường qua BFF admin."
      activeHref="/admin/notifications"
    >
      {/* Hero Banner Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/10">
        <div className="absolute -right-10 -bottom-10 size-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-black uppercase tracking-widest text-blue-100 backdrop-blur-md">
              <Icon name="campaign" /> Communication · Notifications
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight">
              Thông báo nhà trường
            </h2>
            <p className="mt-1 text-sm text-blue-100/90 font-medium">
              Phát hành tin tức, thông điệp điều hành và nhắc nhở tới phụ huynh & học sinh.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white font-bold text-indigo-950 shadow-lg shadow-black/10 hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Icon name="add_alert" />
            <span>Tạo thông báo mới</span>
          </button>
        </div>
      </section>

      {/* Stats Summary Bar */}
      {notificationsQuery.data ? (
        <section
          aria-label="Nhịp phát hành thông báo"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-sm p-5 sm:p-6 shadow-sm"
        >
          <div>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {notificationsQuery.data.total}{" "}
              <span className="text-base font-bold text-slate-500">đã phát hành</span>
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Theo bộ lọc hiện tại</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-bold text-slate-700">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200/60">
              <span className="size-2 rounded-full bg-indigo-500 animate-pulse" />
              {tagCount} nhóm nội dung trên trang
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200/60 font-mono text-slate-600">
              <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
              {latestSentAt
                ? `Mới nhất ${new Intl.DateTimeFormat("vi-VN").format(new Date(latestSentAt))}`
                : "Chưa có lần phát hành"}
            </span>
          </div>
        </section>
      ) : null}

      {/* Filter and Search Section */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setQuery(searchInput.trim());
        }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
      >
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
            search
          </span>
          <input
            aria-label="Tìm thông báo"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tìm tiêu đề hoặc nội dung..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
          />
        </div>

        <select
          aria-label="Lọc phân loại"
          value={tag}
          onChange={(event) => {
            setPage(1);
            setTag(event.target.value);
          }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-semibold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none cursor-pointer transition-all"
        >
          <option value="">Tất cả phân loại</option>
          <option value="Quan trong">Quan trọng</option>
          <option value="Hoc tap">Học tập</option>
          <option value="Dich vu">Dịch vụ</option>
          <option value="Su kien">Sự kiện</option>
        </select>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-white text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          Tìm kiếm
        </button>
      </form>

      {/* Feedback Alert */}
      {feedback ? (
        <div role="status" className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
            {feedback}
          </span>
          <button type="button" onClick={() => setFeedback("")} className="text-emerald-600 hover:text-emerald-900 font-bold text-xs">
            Đóng
          </button>
        </div>
      ) : null}

      {/* Notifications List Content */}
      {notificationsQuery.isPending ? (
        <div role="status" className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-medium text-slate-500 space-y-3">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p>Đang tải thông báo...</p>
        </div>
      ) : notificationsQuery.isError ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center space-y-3">
          <p className="font-bold text-rose-800">Không thể tải danh sách thông báo.</p>
          <button
            type="button"
            onClick={() => void notificationsQuery.refetch()}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow hover:bg-rose-700 transition-all"
          >
            Thử tải lại
          </button>
        </div>
      ) : notificationsQuery.data?.items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 space-y-2">
          <span className="material-symbols-outlined text-4xl text-slate-300">notifications_off</span>
          <p className="font-bold text-slate-700">Chưa có thông báo phù hợp.</p>
          <p className="text-xs text-slate-400">Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn phân loại khác.</p>
        </div>
      ) : (
        <section aria-label="Danh sách thông báo" className="grid gap-4">
          {notificationsQuery.data?.items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all space-y-3 relative group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold border ${getTagStyle(item.tag)}`}>
                    {item.tag}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                    {item.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  aria-label={`Sửa ${item.title}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all cursor-pointer shrink-0"
                >
                  <Icon name="edit" />
                  <span>Sửa</span>
                </button>
              </div>

              <p className="text-sm leading-relaxed text-slate-600 font-normal">
                {item.content}
              </p>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-2 text-slate-500 font-medium">
                  <span className="size-6 rounded-full bg-indigo-100 text-indigo-800 grid place-items-center text-[10px] font-black uppercase">
                    {item.sender.charAt(0) || "B"}
                  </span>
                  Người gửi: <strong className="text-slate-800 font-bold">{item.sender}</strong>
                </span>

                {item.sent_at ? (
                  <span className="font-mono text-slate-400 font-semibold">
                    {new Date(item.sent_at).toLocaleDateString("vi-VN")}
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Pagination Controls */}
      {notificationsQuery.data && notificationsQuery.data.total > notificationsQuery.data.page_size ? (
        <nav
          aria-label="Phân trang thông báo"
          className="flex items-center justify-between pt-2 border-t border-slate-200/60"
        >
          <span className="text-xs font-bold text-slate-500">
            Trang {page} / {Math.ceil(notificationsQuery.data.total / notificationsQuery.data.page_size)}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all cursor-pointer"
            >
              Trang trước
            </button>
            <button
              type="button"
              disabled={!notificationsQuery.data.has_next}
              onClick={() => setPage((value) => value + 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all cursor-pointer"
            >
              Trang sau
            </button>
          </div>
        </nav>
      ) : null}

      {/* Modal Dialog Form */}
      {showForm ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-form-title"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 id="notification-form-title" className="text-xl font-black text-slate-900">
                {editing ? "Chỉnh sửa thông báo" : "Tạo thông báo"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center text-slate-500 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tiêu đề thông báo
                </span>
                <input
                  aria-label="Tiêu đề thông báo"
                  required
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Nhập tiêu đề thông báo..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Người gửi
                  </span>
                  <input
                    required
                    value={form.sender}
                    onChange={(event) => setForm({ ...form, sender: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Phân loại
                  </span>
                  <select
                    value={form.tag}
                    onChange={(event) => setForm({ ...form, tag: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none cursor-pointer transition-all"
                  >
                    <option value="Quan trong">Quan trọng</option>
                    <option value="Hoc tap">Học tập</option>
                    <option value="Dich vu">Dịch vụ</option>
                    <option value="Su kien">Sự kiện</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nội dung
                </span>
                <textarea
                  required
                  rows={4}
                  value={form.content}
                  onChange={(event) => setForm({ ...form, content: event.target.value })}
                  placeholder="Nhập nội dung chi tiết thông báo..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                />
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-sm shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {editing ? "Lưu thay đổi" : "Phát hành"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}

