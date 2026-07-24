"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin-shell";

export default function SystemAdminPage() {
  return (
    <AdminShell
      title="Hệ thống"
      subtitle="Cấu hình hệ thống, quản lý năm học hiện tại, nhật ký và thiết lập vận hành."
      activeHref="/admin/system"
    >
      {/* Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
            System Administration · Hệ Thống
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Cấu hình vận hành & Nhật ký hệ thống
          </h2>
          <p className="mt-2 text-base leading-relaxed text-white/90">
            Thiết lập năm học hiện tại, học kỳ, phân quyền tài khoản và tra cứu Audit Log các tác vụ quản trị.
          </p>
        </div>
      </section>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-[var(--foreground)]">Ngữ Cảnh Năm Học & Học Kỳ</h3>
          <p className="text-base text-[var(--secondary)]">Năm học active mặc định toàn hệ thống cho dữ liệu điểm danh, học phí và điểm số.</p>
          <div className="border border-[var(--outline-variant)] rounded-xl p-4 bg-[var(--surface-container)] space-y-2 text-base">
            <p className="font-bold text-[var(--foreground)]">Năm học: 2025-2026</p>
            <p className="font-bold text-indigo-700">Học kỳ hiện tại: Học kỳ 2</p>
          </div>
        </div>

        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-[var(--foreground)]">Nhật Ký Tác Vụ (Audit Log)</h3>
          <p className="text-base text-[var(--secondary)]">Ghi nhận lịch sử thao tác tạo, sửa, xóa dữ liệu nhạy cảm của các tài khoản quản trị.</p>
          <div className="border border-[var(--outline-variant)] rounded-xl p-4 bg-[var(--surface-container)] font-mono text-sm text-[var(--foreground)]">
            [2026-07-24 09:15] Super Admin updated attendance session 6A1
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
