"use client";

import { AdminShell, Icon } from "@/features/admin-shell";
import { useFeedbackQuery, useUpdateFeedbackStatusMutation } from "../hooks/use-feedback";

export function FeedbackPage() {
  const feedbackQuery = useFeedbackQuery();
  const updateStatusMutation = useUpdateFeedbackStatusMutation();

  const handleUpdateStatus = (id: string, status: "new" | "in_progress" | "resolved") => {
    updateStatusMutation.mutate({ id, status });
  };

  return (
    <AdminShell
      title="Phản hồi"
      subtitle="Tiếp nhận và xử lý ý kiến đóng góp từ phụ huynh và học sinh qua BFF /api/admin/feedback."
      activeHref="/admin/feedback"
    >
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

      {feedbackQuery.isPending ? (
        <div role="status" className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-sm text-[var(--secondary)]">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent mb-3" />
          Đang tải danh sách phản hồi từ server...
        </div>
      ) : feedbackQuery.isError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p className="font-bold">Không thể tải danh sách phản hồi.</p>
          <button
            type="button"
            onClick={() => void feedbackQuery.refetch()}
            className="mt-3 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Thử tải lại
          </button>
        </div>
      ) : feedbackQuery.data?.length === 0 ? (
        <div className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-sm text-[var(--secondary)]">
          Chưa có phản hồi nào được gửi tới hệ thống.
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackQuery.data?.map((fb) => (
            <div key={fb.id} className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 mb-2 uppercase">
                    {fb.category}
                  </span>
                  <h3 className="text-lg font-bold text-[var(--foreground)]">{fb.title}</h3>
                </div>
                <span className="text-xs text-[var(--secondary)] font-mono whitespace-nowrap">
                  {new Date(fb.created_at).toLocaleString("vi-VN")}
                </span>
              </div>
              <p className="text-sm text-[var(--secondary)] leading-relaxed">{fb.content}</p>

              <div className="pt-3 text-xs text-[var(--secondary)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[var(--outline-variant)]">
                <span>Học sinh / Phụ huynh ID: <strong className="text-[var(--foreground)]">{fb.student_id || fb.account_id || "Khách"}</strong></span>

                <div className="flex items-center gap-2">
                  <span className="font-bold">Trạng thái:</span>
                  <select
                    value={fb.status}
                    disabled={updateStatusMutation.isPending}
                    onChange={(e) => handleUpdateStatus(fb.id, e.target.value as "new" | "in_progress" | "resolved")}
                    className="bg-white border border-[var(--outline-variant)] rounded-lg text-xs font-bold px-2.5 py-1 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="new">🆕 Mới</option>
                    <option value="in_progress">⏳ Đang xử lý</option>
                    <option value="resolved">✅ Đã giải quyết</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
