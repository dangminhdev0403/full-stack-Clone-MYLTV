"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin-shell";

export default function BusAdminPage() {
  return (
    <AdminShell
      title="Xe buýt"
      subtitle="Theo dõi tuyến xe, điểm đón trả và định vị thời gian thực theo API /services/bus-tracking."
      activeHref="/admin/services/bus"
    >
      {/* Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
              Student Services · Xe Đưa Đón
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Quản lý tuyến xe buýt & Định vị GPS Realtime
            </h2>
            <p className="mt-2 text-base leading-relaxed text-white/90">
              Theo dõi danh sách tuyến xe, tài xế phụ trách, điểm đón trả và tọa độ thời gian thực trên bản đồ di động.
            </p>
          </div>
          <button className="bg-white text-[var(--primary)] font-bold text-base px-5 py-3 rounded-xl shadow-md hover:bg-slate-50">
            + Thêm Tuyến Xe Mới
          </button>
        </div>
      </section>

      {/* Bus Routes Table */}
      <div className="bg-white border border-[var(--outline-variant)] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-base text-[var(--foreground)]">
          <thead className="bg-[var(--surface-container)] text-[var(--secondary)] font-bold border-b border-[var(--outline-variant)] uppercase text-xs">
            <tr>
              <th className="px-5 py-4">Tên Tuyến Xe</th>
              <th className="px-5 py-4">Biển Số Xe</th>
              <th className="px-5 py-4">Tài Xế & Số Điện Thoại</th>
              <th className="px-5 py-4">Điểm Đón / Trả Đặt Trước</th>
              <th className="px-5 py-4">Giờ Đón</th>
              <th className="px-5 py-4">Trạng Thái GPS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--outline-variant)] text-sm">
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-bold text-[var(--foreground)]">Tuyến 01: Lương Thế Vinh - Hà Đông</td>
              <td className="px-5 py-4 font-mono font-bold text-indigo-700">29B-123.45</td>
              <td className="px-5 py-4 text-[var(--foreground)] font-medium">Nguyễn Văn Tài (0987.654.321)</td>
              <td className="px-5 py-4 text-[var(--secondary)]">Trạm Phùng Hưng → Cổng Trường LTV</td>
              <td className="px-5 py-4 font-bold text-amber-700">06:45 sáng</td>
              <td className="px-5 py-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Đang hoạt động (GPS On)
                </span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-bold text-[var(--foreground)]">Tuyến 02: Lương Thế Vinh - Cầu Giấy</td>
              <td className="px-5 py-4 font-mono font-bold text-indigo-700">29B-678.90</td>
              <td className="px-5 py-4 text-[var(--foreground)] font-medium">Lê Hoàng Nam (0912.345.678)</td>
              <td className="px-5 py-4 text-[var(--secondary)]">Công viên Cầu Giấy → Cổng Trường LTV</td>
              <td className="px-5 py-4 font-bold text-amber-700">06:40 sáng</td>
              <td className="px-5 py-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Đang hoạt động (GPS On)
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
