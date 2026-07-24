"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin-shell";

export default function ReportsAdminPage() {
  return (
    <AdminShell
      title="Báo cáo"
      subtitle="Tổng hợp báo cáo vận hành, học tập, thu học phí và các dịch vụ học sinh."
      activeHref="/admin/reports"
    >
      {/* Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
            Analytics & Reports · Báo Cáo
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Báo cáo tổng hợp nhà trường
          </h2>
          <p className="mt-2 text-base leading-relaxed text-white/90">
            Thống kê tỷ lệ chuyên cần, thu học phí, kết quả học tập và tổng quan sử dụng dịch vụ ứng dụng di động.
          </p>
        </div>
      </section>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-3">
          <h3 className="text-xl font-bold text-[var(--foreground)]">Báo Cáo Chuyên Cần</h3>
          <p className="text-base text-[var(--secondary)]">Thống kê số ngày đi học đúng giờ, đi muộn và vắng mặt theo lớp & khối.</p>
          <div className="pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-700">Tỷ lệ đúng giờ: 98.4%</span>
            <button className="text-sm text-[var(--primary)] font-bold hover:underline">Xuất Excel</button>
          </div>
        </div>

        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-3">
          <h3 className="text-xl font-bold text-[var(--foreground)]">Báo Cáo Thu Học Phí</h3>
          <p className="text-base text-[var(--secondary)]">Tổng hợp số tiền đã thu, khoản còn nợ và danh sách cần gửi nhắc nhở.</p>
          <div className="pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between">
            <span className="text-sm font-bold text-indigo-700">Đã hoàn thành: 94.2%</span>
            <button className="text-sm text-[var(--primary)] font-bold hover:underline">Xuất Báo Cáo</button>
          </div>
        </div>

        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-3">
          <h3 className="text-xl font-bold text-[var(--foreground)]">Báo Cáo Kết Quả Học Tập</h3>
          <p className="text-base text-[var(--secondary)]">Phân loại học lực Giỏi, Khá, Trung bình và xếp hạng thi đua các lớp.</p>
          <div className="pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between">
            <span className="text-sm font-bold text-purple-700">Học sinh Giỏi: 68.5%</span>
            <button className="text-sm text-[var(--primary)] font-bold hover:underline">Xem Chi Tiết</button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
