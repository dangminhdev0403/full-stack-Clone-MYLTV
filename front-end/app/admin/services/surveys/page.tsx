"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin-shell";

export default function SurveysAdminPage() {
  return (
    <AdminShell
      title="Khảo sát"
      subtitle="Thu thập phản hồi qua phiếu khảo sát dành cho phụ huynh và học sinh theo API /services/surveys."
      activeHref="/admin/services/surveys"
    >
      {/* Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
              Student Services · Khảo Sát
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Phiếu khảo sát ý kiến phụ huynh & học sinh
            </h2>
            <p className="mt-2 text-base leading-relaxed text-white/90">
              Tạo phiếu khảo sát chất lượng giảng dạy, dịch vụ bán trú và các hoạt động nhà trường.
            </p>
          </div>
          <button className="bg-white text-[var(--primary)] font-bold text-base px-5 py-3 rounded-xl shadow-md hover:bg-slate-50">
            + Tạo Phiếu Khảo Sát
          </button>
        </div>
      </section>

      {/* Survey List */}
      <div className="space-y-4">
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Đang diễn ra
            </span>
            <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
              Hạn nộp: 2026-06-30 23:59
            </span>
          </div>
          <h3 className="text-xl font-bold text-[var(--foreground)]">Khảo sát chất lượng bữa ăn bán trú Học kỳ 2</h3>
          <p className="text-base text-[var(--secondary)] leading-relaxed">
            Phiếu thu thập đánh giá của phụ huynh về khẩu phần ăn, vệ sinh an toàn thực phẩm và sự đa dạng của thực đơn bán trú.
          </p>
          <div className="pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between text-sm text-[var(--secondary)]">
            <span>Số câu hỏi: <strong className="text-[var(--foreground)]">5 câu (Trắc nghiệm + Đánh giá sao)</strong></span>
            <span className="text-indigo-700 font-bold">Đã nhận 845 phản hồi</span>
          </div>
        </div>

        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Đã kết thúc
            </span>
            <span className="text-xs text-[var(--secondary)] font-mono">
              Hạn nộp: 2026-05-15 23:59
            </span>
          </div>
          <h3 className="text-xl font-bold text-[var(--foreground)]">Khảo sát nhu cầu đăng ký Câu lạc bộ hè 2026</h3>
          <p className="text-base text-[var(--secondary)] leading-relaxed">
            Thu thập nguyện vọng tham gia các CLB năng khiếu (Bóng đá, STEM, Âm nhạc, Vẽ) trong dịp nghỉ hè.
          </p>
          <div className="pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between text-sm text-[var(--secondary)]">
            <span>Số câu hỏi: <strong className="text-[var(--foreground)]">3 câu</strong></span>
            <span className="text-indigo-700 font-bold">Đã nhận 1,120 phản hồi</span>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
