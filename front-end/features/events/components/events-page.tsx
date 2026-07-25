"use client";

import { useState } from "react";
import { AdminShell, Icon } from "@/features/admin-shell";
import { useAdminEventsQuery, useCreateAdminEventMutation, useDeleteAdminEventMutation } from "../hooks/use-events";

export function EventsPage() {
  const eventsQuery = useAdminEventsQuery();
  const createMutation = useCreateAdminEventMutation();
  const deleteMutation = useDeleteAdminEventMutation();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_at: "2026-06-20T08:30",
    end_at: "2026-06-20T11:30",
    location: "Hội trường A",
    registration_deadline: "2026-06-18T17:00",
  });
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;
    setFeedback(null);
    createMutation.mutate(
      {
        title: formData.title,
        description: formData.description,
        start_at: new Date(formData.start_at).toISOString(),
        end_at: new Date(formData.end_at).toISOString(),
        location: formData.location,
        registration_deadline: new Date(formData.registration_deadline).toISOString(),
        status: "open",
      },
      {
        onSuccess: () => {
          setFeedback({ type: "success", message: "Tạo sự kiện thành công!" });
          setShowCreateModal(false);
          setFormData({
            title: "",
            description: "",
            start_at: "2026-06-20T08:30",
            end_at: "2026-06-20T11:30",
            location: "Hội trường A",
            registration_deadline: "2026-06-18T17:00",
          });
        },
        onError: (err: Error) => {
          setFeedback({ type: "error", message: err.message || "Không thể tạo sự kiện." });
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <AdminShell
      title="Sự kiện"
      subtitle="Tổ chức sự kiện, lịch hoạt động và theo dõi danh sách tham gia qua BFF /api/admin/events."
      activeHref="/admin/services/events"
    >
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
              Student Services · Sự Kiện
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Quản lý sự kiện & Hoạt động ngoại khóa
            </h2>
            <p className="mt-2 text-base leading-relaxed text-white/90">
              Tạo sự kiện mới, thiết lập thời gian diễn ra, địa điểm và nhận đăng ký trực tuyến từ ứng dụng di động.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-base text-[var(--primary)] shadow-md hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Icon name="event" />
            + Tạo Sự Kiện Mới
          </button>
        </div>
      </section>

      {feedback && (
        <div className={`p-4 rounded-xl border font-semibold text-sm ${feedback.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"}`}>
          {feedback.message}
        </div>
      )}

      {eventsQuery.isPending ? (
        <div role="status" className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-base text-[var(--secondary)]">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent mb-3" />
          Đang tải danh sách sự kiện từ server...
        </div>
      ) : eventsQuery.isError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p className="font-bold">Không thể tải danh sách sự kiện từ server.</p>
          <button
            type="button"
            onClick={() => void eventsQuery.refetch()}
            className="mt-3 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Thử tải lại
          </button>
        </div>
      ) : eventsQuery.data?.items.length === 0 ? (
        <div className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-base text-[var(--secondary)]">
          Chưa có sự kiện nào trong hệ thống.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {eventsQuery.data?.items.map((evt) => (
            <div key={evt.id} className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    Trạng thái: {evt.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--secondary)] font-mono">ID: {evt.id}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(evt.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Xóa sự kiện"
                    >
                      <Icon name="delete" className="text-sm" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] leading-snug">{evt.title}</h3>
                <p className="text-base text-[var(--secondary)] leading-relaxed">{evt.description}</p>
              </div>

              <div className="pt-4 border-t border-[var(--outline-variant)] space-y-2 text-sm text-[var(--secondary)]">
                <div className="flex items-center gap-2">
                  <Icon name="schedule" className="text-[var(--primary)] text-base" />
                  <span>Thời gian: <strong className="text-[var(--foreground)]">{new Date(evt.start_at).toLocaleString("vi-VN")}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="location_on" className="text-[var(--primary)] text-base" />
                  <span>Địa điểm: <strong className="text-[var(--foreground)]">{evt.location || "Chưa cập nhật"}</strong></span>
                </div>
                {evt.registration_deadline && (
                  <div className="flex items-center gap-2 text-amber-700 font-medium">
                    <Icon name="timer" className="text-amber-600 text-base" />
                    <span>Hạn đăng ký: {new Date(evt.registration_deadline).toLocaleString("vi-VN")}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-blue-700 font-medium pt-1">
                  <Icon name="groups" className="text-blue-600 text-base" />
                  <span>Số lượt đăng ký: <strong className="text-blue-900">{evt.registration_count ?? 0} học sinh</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[var(--outline-variant)] rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">Tạo Sự Kiện Mới</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-1">Tên sự kiện</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tên sự kiện..."
                  className="w-full bg-white border border-[var(--outline-variant)] text-base rounded-xl p-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-1">Mô tả sự kiện</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nội dung chi tiết sự kiện..."
                  className="w-full bg-white border border-[var(--outline-variant)] text-base rounded-xl p-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-1">Địa điểm tổ chức</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-white border border-[var(--outline-variant)] text-base rounded-xl p-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-[var(--foreground)] mb-1">Thời gian bắt đầu</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_at}
                    onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                    className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-xl p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--foreground)] mb-1">Hạn đăng ký</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                    className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-xl p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-base font-bold text-[var(--secondary)] hover:text-[var(--foreground)]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2.5 text-base bg-[var(--primary)] text-white font-bold rounded-xl shadow-sm hover:opacity-90 disabled:opacity-50"
                >
                  {createMutation.isPending ? "Đang tạo..." : "Tạo Sự Kiện"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
