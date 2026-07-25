"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin-shell";

export default function ClubsAdminPage() {
  return (
    <AdminShell
      title="Câu lạc bộ"
      subtitle="Quản lý câu lạc bộ, lịch sinh hoạt và đăng ký thành viên theo API /services/clubs."
      activeHref="/admin/services/clubs"
    >
      {/* Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
              Student Services · Câu Lạc Bộ
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Quản lý Câu lạc bộ ngoại khóa
            </h2>
            <p className="mt-2 text-base leading-relaxed text-white/90">
              Danh sách các CLB thể thao, nghệ thuật, STEM và ghi nhận đơn đăng ký thành viên mới.
            </p>
          </div>
          <button className="bg-white text-[var(--primary)] font-bold text-base px-5 py-3 rounded-xl shadow-md hover:bg-slate-50">
            + Thành Lập CLB Mới
          </button>
        </div>
      </section>

      {/* Clubs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Thể Thao
            </span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Đang mở đăng ký
            </span>
          </div>
          <h3 className="text-xl font-bold text-[var(--foreground)]">Câu lạc bộ Bóng Rổ</h3>
          <p className="text-base text-[var(--secondary)] leading-relaxed">
            Rèn luyện thể lực, kỹ thuật ném bóng, phối hợp đồng đội và tham gia giải đấu giao hữu liên trường.
          </p>
          <div className="pt-3 border-t border-[var(--outline-variant)] space-y-1.5 text-sm text-[var(--secondary)]">
            <p>Giáo viên chủ nhiệm: <strong className="text-[var(--foreground)]">Thầy Nguyễn Văn Hoàng</strong></p>
            <p>Lịch sinh hoạt: <strong className="text-[var(--foreground)]">Thứ 3 & Thứ 5 (16:30 - 18:00)</strong></p>
            <p>Địa điểm: <strong className="text-[var(--foreground)]">Nhà thi đấu đa năng</strong></p>
          </div>
        </div>

        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Khoa Học & STEM
            </span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Đang mở đăng ký
            </span>
          </div>
          <h3 className="text-xl font-bold text-[var(--foreground)]">Câu lạc bộ Robotics & Sáng Tạo STEM</h3>
          <p className="text-base text-[var(--secondary)] leading-relaxed">
            Học lập trình Arduino, chế tạo robot tự hành và tham gia các cuộc thi sáng tạo khoa học kỹ thuật.
          </p>
          <div className="pt-3 border-t border-[var(--outline-variant)] space-y-1.5 text-sm text-[var(--secondary)]">
            <p>Giáo viên chủ nhiệm: <strong className="text-[var(--foreground)]">Cô Trần Thị Hương</strong></p>
            <p>Lịch sinh hoạt: <strong className="text-[var(--foreground)]">Thứ 7 (08:30 - 11:00)</strong></p>
            <p>Địa điểm: <strong className="text-[var(--foreground)]">Phòng Lab STEM</strong></p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
