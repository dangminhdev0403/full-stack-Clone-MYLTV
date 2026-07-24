"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin-shell";

export default function UniformsAdminPage() {
  return (
    <AdminShell
      title="Đồng phục"
      subtitle="Quản lý đồng phục, kích cỡ và đơn đăng ký cấp phát theo API /services/uniforms."
      activeHref="/admin/services/uniforms"
    >
      {/* Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
              Student Services · Đồng Phục
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Quản lý đồng phục & Đơn mua trực tuyến
            </h2>
            <p className="mt-2 text-base leading-relaxed text-white/90">
              Danh mục áo sơ mi, áo thể thao, quần tây, chân váy, bảng size và theo dõi đơn mua của phụ huynh.
            </p>
          </div>
          <button className="bg-white text-[var(--primary)] font-bold text-base px-5 py-3 rounded-xl shadow-md hover:bg-slate-50">
            + Thêm Sản Phẩm Mới
          </button>
        </div>
      </section>

      {/* Uniform Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-3">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Áo sơ mi
          </span>
          <h3 className="text-xl font-bold text-[var(--foreground)]">Áo sơ mi đồng phục Luong The Vinh (Nam/Nữ)</h3>
          <p className="text-base font-bold text-indigo-700">180,000 VNĐ</p>
          <p className="text-sm text-[var(--secondary)]">Kích cỡ sẵn có: S, M, L, XL, XXL</p>
          <div className="pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between text-sm">
            <span className="text-[var(--secondary)]">Tồn kho: <strong className="text-[var(--foreground)]">450 cái</strong></span>
            <span className="text-emerald-700 font-bold">Còn hàng</span>
          </div>
        </div>

        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-3">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            Thể thao
          </span>
          <h3 className="text-xl font-bold text-[var(--foreground)]">Bộ quần áo thể dục nhà trường</h3>
          <p className="text-base font-bold text-indigo-700">220,000 VNĐ</p>
          <p className="text-sm text-[var(--secondary)]">Kích cỡ sẵn có: S, M, L, XL</p>
          <div className="pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between text-sm">
            <span className="text-[var(--secondary)]">Tồn kho: <strong className="text-[var(--foreground)]">320 bộ</strong></span>
            <span className="text-emerald-700 font-bold">Còn hàng</span>
          </div>
        </div>

        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-3">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Áo khoác
          </span>
          <h3 className="text-xl font-bold text-[var(--foreground)]">Áo khoác gió mùa đông LTV</h3>
          <p className="text-base font-bold text-indigo-700">350,000 VNĐ</p>
          <p className="text-sm text-[var(--secondary)]">Kích cỡ sẵn có: M, L, XL</p>
          <div className="pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between text-sm">
            <span className="text-[var(--secondary)]">Tồn kho: <strong className="text-[var(--foreground)]">180 cái</strong></span>
            <span className="text-emerald-700 font-bold">Còn hàng</span>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
