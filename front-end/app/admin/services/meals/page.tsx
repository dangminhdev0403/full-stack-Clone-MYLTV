"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin-shell";

export default function MealsAdminPage() {
  const [selectedWeek, setSelectedWeek] = useState("2026-W25");

  return (
    <AdminShell
      title="Bữa ăn"
      subtitle="Quản lý thực đơn, suất ăn bán trú và đăng ký bữa ăn của học sinh theo API /services/meals."
      activeHref="/admin/services/meals"
    >
      {/* Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
              Student Services · Bán Trú
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Thực đơn & Đăng ký suất ăn bán trú
            </h2>
            <p className="mt-2 text-base leading-relaxed text-white/90">
              Cập nhật món ăn sáng, trưa, xế và thống kê tổng số suất ăn hàng ngày của nhà trường.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="bg-white border border-[var(--outline-variant)] text-base rounded-xl px-3 py-2 text-[var(--foreground)] font-bold"
            />
            <button className="bg-white text-[var(--primary)] font-bold text-base px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50">
              Cập nhật thực đơn
            </button>
          </div>
        </div>
      </section>

      {/* Menu Table */}
      <div className="bg-white border border-[var(--outline-variant)] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-base text-[var(--foreground)]">
          <thead className="bg-[var(--surface-container)] text-[var(--secondary)] font-bold border-b border-[var(--outline-variant)] uppercase text-xs">
            <tr>
              <th className="px-5 py-4">Ngày Trong Tuần</th>
              <th className="px-5 py-4">Bữa Sáng</th>
              <th className="px-5 py-4">Bữa Trưa (Bán Trú)</th>
              <th className="px-5 py-4">Bữa Xế</th>
              <th className="px-5 py-4">Số Suất Đăng Ký</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--outline-variant)] text-sm">
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-bold text-[var(--foreground)]">Thứ 2 (22/06)</td>
              <td className="px-5 py-4 text-[var(--secondary)]">Bánh mì bò kho + Sữa tươi</td>
              <td className="px-5 py-4 text-emerald-700 font-bold">Cơm sườn rim + Canh cải thịt băm + Táo</td>
              <td className="px-5 py-4 text-[var(--secondary)]">Sữa chua nếp cẩm</td>
              <td className="px-5 py-4 font-mono font-bold text-indigo-700">1,250 suất</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-bold text-[var(--foreground)]">Thứ 3 (23/06)</td>
              <td className="px-5 py-4 text-[var(--secondary)]">Phở gà Hà Nội</td>
              <td className="px-5 py-4 text-emerald-700 font-bold">Cơm gà chiên mắm + Canh bí tôm + Dưa hấu</td>
              <td className="px-5 py-4 text-[var(--secondary)]">Chè đậu xanh</td>
              <td className="px-5 py-4 font-mono font-bold text-indigo-700">1,248 suất</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-bold text-[var(--foreground)]">Thứ 4 (24/06)</td>
              <td className="px-5 py-4 text-[var(--secondary)]">Bún mọc sườn chua</td>
              <td className="px-5 py-4 text-emerald-700 font-bold">Cơm cá thu sốt cà + Canh chua cá + Chuối</td>
              <td className="px-5 py-4 text-[var(--secondary)]">Bánh su kem</td>
              <td className="px-5 py-4 font-mono font-bold text-indigo-700">1,255 suất</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-bold text-[var(--foreground)]">Thứ 5 (25/06)</td>
              <td className="px-5 py-4 text-[var(--secondary)]">Xôi xéo chả lụa</td>
              <td className="px-5 py-4 text-emerald-700 font-bold">Cơm thịt kho trứng + Canh rau ngót + Dưa lưới</td>
              <td className="px-5 py-4 text-[var(--secondary)]">Sữa hạt óc chó</td>
              <td className="px-5 py-4 font-mono font-bold text-indigo-700">1,240 suất</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-bold text-[var(--foreground)]">Thứ 6 (26/06)</td>
              <td className="px-5 py-4 text-[var(--secondary)]">Mì Ý sốt bò băm</td>
              <td className="px-5 py-4 text-emerald-700 font-bold">Cơm đùi gà quay + Canh ngô ngọt + Cam tơi</td>
              <td className="px-5 py-4 text-[var(--secondary)]">Bánh flan caramen</td>
              <td className="px-5 py-4 font-mono font-bold text-indigo-700">1,260 suất</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
