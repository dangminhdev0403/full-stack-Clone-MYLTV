"use client";

import { useEffect, useState } from "react";
import { AdminShell, Icon } from "@/features/admin-shell";

interface NotificationItem {
  id: string;
  title: string;
  sender: string;
  sent_at: string;
  content: string;
  tag: string;
  is_read: boolean;
}

export default function NotificationsAdminPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", sender: "Ban giám hiệu", content: "", tag: "Quan trong" });
  const [saving, setSaving] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        setItems([
          {
            id: "notif-01",
            title: "Lịch họp phụ huynh cuối học kỳ 2",
            sender: "Ban giám hiệu",
            sent_at: new Date().toISOString(),
            content: "Kính mời quý phụ huynh tham dự buổi họp phụ huynh tổng kết học kỳ 2 vào lúc 8h00 Chủ Nhật.",
            tag: "Quan trong",
            is_read: false,
          },
          {
            id: "notif-02",
            title: "Thông báo lịch nghỉ lễ Quốc tế Lao động",
            sender: "Văn phòng nhà trường",
            sent_at: new Date(Date.now() - 86400000).toISOString(),
            content: "Học sinh toàn trường nghỉ học từ ngày 30/04 đến hết ngày 01/05.",
            tag: "Hanh chinh",
            is_read: true,
          },
        ]);
      }
    } catch {
      setItems([
        {
          id: "notif-01",
          title: "Lịch họp phụ huynh cuối học kỳ 2",
          sender: "Ban giám hiệu",
          sent_at: new Date().toISOString(),
          content: "Kính mời quý phụ huynh tham dự buổi họp phụ huynh tổng kết học kỳ 2 vào lúc 8h00 Chủ Nhật.",
          tag: "Quan trong",
          is_read: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const created = await res.json();
        setItems((prev) => [created, ...prev]);
      } else {
        const createdItem: NotificationItem = {
          id: `notif-${Date.now()}`,
          title: formData.title,
          sender: formData.sender,
          sent_at: new Date().toISOString(),
          content: formData.content,
          tag: formData.tag,
          is_read: false,
        };
        setItems((prev) => [createdItem, ...prev]);
      }
      setShowCreateModal(false);
      setFormData({ title: "", sender: "Ban giám hiệu", content: "", tag: "Quan trong" });
    } catch {
      const createdItem: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: formData.title,
        sender: formData.sender,
        sent_at: new Date().toISOString(),
        content: formData.content,
        tag: formData.tag,
        is_read: false,
      };
      setItems((prev) => [createdItem, ...prev]);
      setShowCreateModal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Thông báo"
      subtitle="Gửi và phát hành thông báo đến toàn bộ phụ huynh, học sinh và nhân sự."
      activeHref="/admin/notifications"
    >
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
              Communication · Notifications
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Quản lý thông báo nhà trường
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Thông báo được gửi trực tiếp đến ứng dụng di động của phụ huynh và học sinh theo API /notifications.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 font-bold text-[var(--primary)] shadow-sm hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Icon name="add_alert" />
            Tạo thông báo mới
          </button>
        </div>
      </section>

      {/* Notifications List */}
      {loading ? (
        <div className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-sm text-[var(--secondary)]">
          Đang tải danh sách thông báo...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 mb-2">
                    {item.tag}
                  </span>
                  <h3 className="text-lg font-bold text-[var(--foreground)]">{item.title}</h3>
                </div>
                <span className="text-xs text-[var(--secondary)] font-mono whitespace-nowrap">
                  {new Date(item.sent_at).toLocaleString("vi-VN")}
                </span>
              </div>
              <p className="text-sm text-[var(--secondary)] leading-relaxed">{item.content}</p>
              <div className="pt-3 text-xs text-[var(--secondary)] flex items-center justify-between border-t border-[var(--outline-variant)]">
                <span>Người gửi: <strong className="text-[var(--foreground)]">{item.sender}</strong></span>
                <span className="font-mono">ID: {item.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[var(--outline-variant)] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Gửi Thông Báo Mới</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Tiêu đề thông báo</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tiêu đề..."
                  className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Người gửi</label>
                  <input
                    type="text"
                    required
                    value={formData.sender}
                    onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                    className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Phân loại (Tag)</label>
                  <select
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="Quan trong">Quan trong</option>
                    <option value="Hoc tap">Hoc tap</option>
                    <option value="Dich vu">Dich vu</option>
                    <option value="Su kien">Su kien</option>
                    <option value="Hanh chinh">Hanh chinh</option>
                    <option value="He thong">He thong</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Nội dung chi tiết</label>
                <textarea
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Nội dung thông báo..."
                  className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm text-[var(--secondary)] hover:text-[var(--foreground)]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm bg-[var(--primary)] text-white font-bold rounded-lg disabled:opacity-50"
                >
                  {saving ? "Đang phát hành..." : "Phát Hành Thông Báo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
