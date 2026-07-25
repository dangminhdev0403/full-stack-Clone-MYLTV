"use client";

import { useEffect, useState } from "react";
import { AdminShell, Icon } from "@/features/admin-shell";

interface EventItem {
  id: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  location: string | null;
  registration_deadline: string | null;
  status: string;
}

export default function EventsAdminPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_at: "2026-06-20T08:30",
    end_at: "2026-06-20T11:30",
    location: "Hội trường A",
    registration_deadline: "2026-06-18T17:00",
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/services/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.items || []);
      } else {
        setEvents([
          {
            id: "evt-01",
            title: "Ngày hội STEM & Khoa học 2026",
            description: "Triển lãm sản phẩm sáng tạo robot, mô hình toán học và thí nghiệm hóa học của học sinh các khối.",
            start_at: new Date(Date.now() + 86400000 * 3).toISOString(),
            end_at: new Date(Date.now() + 86400000 * 3 + 10800000).toISOString(),
            location: "Hội trường chính & Sân trường",
            registration_deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
            status: "open",
          },
          {
            id: "evt-02",
            title: "Giải bóng đá học sinh Cup",
            description: "Giải đấu giao hữu giữa các lớp khối 10 và khối 11 tranh cúp vô địch nhà trường.",
            start_at: new Date(Date.now() + 86400000 * 7).toISOString(),
            end_at: new Date(Date.now() + 86400000 * 7 + 14400000).toISOString(),
            location: "Sân bóng đá cỏ nhân tạo",
            registration_deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
            status: "open",
          },
        ]);
      }
    } catch {
      setEvents([
        {
          id: "evt-01",
          title: "Ngày hội STEM & Khoa học 2026",
          description: "Triển lãm sản phẩm sáng tạo robot, mô hình toán học và thí nghiệm hóa học của học sinh các khối.",
          start_at: new Date(Date.now() + 86400000 * 3).toISOString(),
          end_at: new Date(Date.now() + 86400000 * 3 + 10800000).toISOString(),
          location: "Hội trường chính & Sân trường",
          registration_deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
          status: "open",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const created: EventItem = {
      id: `evt-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      start_at: new Date(formData.start_at).toISOString(),
      end_at: new Date(formData.end_at).toISOString(),
      location: formData.location,
      registration_deadline: new Date(formData.registration_deadline).toISOString(),
      status: "open",
    };
    setEvents([created, ...events]);
    setShowCreateModal(false);
    setFormData({
      title: "",
      description: "",
      start_at: "2026-06-20T08:30",
      end_at: "2026-06-20T11:30",
      location: "Hội trường A",
      registration_deadline: "2026-06-18T17:00",
    });
  };

  return (
    <AdminShell
      title="Sự kiện"
      subtitle="Tổ chức sự kiện, lịch hoạt động và theo dõi danh sách tham gia theo API /services/events."
      activeHref="/admin/services/events"
    >
      {/* Banner */}
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

      {/* Events List */}
      {loading ? (
        <div className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-base text-[var(--secondary)]">
          Đang tải danh sách sự kiện...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((evt) => (
            <div key={evt.id} className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    Trạng thái: {evt.status}
                  </span>
                  <span className="text-xs text-[var(--secondary)] font-mono">ID: {evt.id}</span>
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
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
                  className="px-6 py-2.5 text-base bg-[var(--primary)] text-white font-bold rounded-xl shadow-sm hover:opacity-90"
                >
                  Tạo Sự Kiện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
