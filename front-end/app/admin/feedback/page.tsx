"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/features/admin-shell";

interface FeedbackItem {
  id: string;
  student_id: string | null;
  account_id: string | null;
  title: string;
  content: string;
  category: string;
  status: string;
  created_at: string;
}

export default function FeedbackAdminPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/feedback");
      if (res.ok) {
        const data = await res.json();
        setItems(data || []);
      } else {
        setItems([
          {
            id: "fb-101",
            student_id: "HS001",
            account_id: "acc-parent-01",
            title: "Góp ý về thực đơn bữa ăn bán trú thứ 3",
            content: "Nhờ nhà trường điều chỉnh bổ sung thêm rau xanh cho bữa trưa của các con khối 10.",
            category: "dich_vu",
            status: "new",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setItems([
        {
          id: "fb-101",
          student_id: "HS001",
          account_id: "acc-parent-01",
          title: "Góp ý về thực đơn bữa ăn bán trú thứ 3",
          content: "Nhờ nhà trường điều chỉnh bổ sung thêm rau xanh cho bữa trưa của các con khối 10.",
          category: "dich_vu",
          status: "new",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <AdminShell
      title="Phản hồi"
      subtitle="Tiếp nhận và xử lý ý kiến đóng góp từ phụ huynh và học sinh theo API POST /feedback."
      activeHref="/admin/feedback"
    >
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
            Communication · Phản Hồi
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Tiếp nhận & Xử lý phản hồi
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            Tổng hợp góp ý về học tập, dịch vụ bán trú, tài khoản và hoạt động từ phụ huynh, học sinh.
          </p>
        </div>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-sm text-[var(--secondary)]">
          Đang tải danh sách phản hồi...
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((fb) => (
            <div key={fb.id} className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 mb-2 uppercase">
                    {fb.category}
                  </span>
                  <h3 className="text-lg font-bold text-[var(--foreground)]">{fb.title}</h3>
                </div>
                <span className="text-xs text-[var(--secondary)] font-mono">
                  {new Date(fb.created_at).toLocaleString("vi-VN")}
                </span>
              </div>
              <p className="text-sm text-[var(--secondary)] leading-relaxed">{fb.content}</p>
              <div className="pt-3 text-xs text-[var(--secondary)] flex items-center justify-between border-t border-[var(--outline-variant)]">
                <span>Học sinh / Phụ huynh ID: <strong className="text-[var(--foreground)]">{fb.student_id || fb.account_id || "Khách"}</strong></span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  Trạng thái: {fb.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
