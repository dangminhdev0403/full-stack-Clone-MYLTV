"use client";

import { useState } from "react";
import { AdminShell, Icon } from "@/features/admin-shell";

export default function HomeworksAdminPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <AdminShell
      title="Bài tập"
      subtitle="Giao, theo dõi và tổng hợp bài tập về nhà của học sinh theo API /students/:id/homeworks."
      activeHref="/admin/homeworks"
    >
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
              Academics · Bài Tập Về Nhà
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Quản lý giao bài tập & Tiến độ
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Hệ thống tự động theo dõi hạn nộp và thống kê số lượng học sinh đã hoàn thành.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 font-bold text-[var(--primary)] shadow-sm hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Icon name="assignment" />
            + Giao Bài Tập Mới
          </button>
        </div>
      </section>

      {/* Homework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Toán Học
            </span>
            <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Hạn nộp: 2026-06-27 20:00
            </span>
          </div>
          <h3 className="text-lg font-bold text-[var(--foreground)]">Bài tập Giải Tích - Đạo hàm & Tiệm cận</h3>
          <p className="text-sm text-[var(--secondary)] leading-relaxed">
            Hoàn thành bài tập 1 đến 5 trang 42 SGK và nộp hình ảnh bài giải lên ứng dụng di động.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-[var(--outline-variant)] text-xs text-[var(--secondary)]">
            <span>Giáo viên: Nguyễn Văn Minh</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Đã nộp 32/35 học sinh
            </span>
          </div>
        </div>

        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Tiếng Anh
            </span>
            <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Hạn nộp: 2026-06-28 22:00
            </span>
          </div>
          <h3 className="text-lg font-bold text-[var(--foreground)]">Unit 10 Essay Writing: Environmental Protection</h3>
          <p className="text-sm text-[var(--secondary)] leading-relaxed">
            Write a 250-word essay proposing solutions for plastic pollution in school.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-[var(--outline-variant)] text-xs text-[var(--secondary)]">
            <span>Giáo viên: Phạm Thị Thu</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Đã nộp 28/35 học sinh
            </span>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
