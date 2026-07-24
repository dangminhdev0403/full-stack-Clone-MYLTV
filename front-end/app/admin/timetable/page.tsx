"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin-shell";

export default function TimetableAdminPage() {
  const [selectedClass, setSelectedClass] = useState("10A1");

  return (
    <AdminShell
      title="Thời khóa biểu"
      subtitle="Sắp xếp lịch học, phòng học và phân công giảng dạy theo API /students/:id/timetable."
      activeHref="/admin/timetable"
    >
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
              Academics · Thời Khóa Biểu
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Lịch học & Phân công giảng dạy
            </h2>
            <p className="mt-2 text-base leading-relaxed text-white/90">
              Cập nhật lịch học theo từng lớp và hiển thị realtime trên ứng dụng phụ huynh / học sinh.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-white border border-[var(--outline-variant)] text-base rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-bold"
            >
              <option value="10A1">Lớp 10A1</option>
              <option value="10A2">Lớp 10A2</option>
              <option value="11A1">Lớp 11A1</option>
              <option value="12A1">Lớp 12A1</option>
            </select>
            <button className="bg-white text-[var(--primary)] font-bold text-base px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap shadow-sm">
              Lưu thời khóa biểu
            </button>
          </div>
        </div>
      </section>

      {/* Timetable Table */}
      <div className="bg-white border border-[var(--outline-variant)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base text-[var(--foreground)] border-collapse table-fixed">
            <thead className="bg-[var(--surface-container)] text-[var(--secondary)] font-bold border-b border-[var(--outline-variant)] uppercase text-sm tracking-wider">
              <tr>
                <th className="px-5 py-4 w-48 text-left">Tiết</th>
                <th className="px-5 py-4 text-left">Thứ 2 (T2)</th>
                <th className="px-5 py-4 text-left">Thứ 3 (T3)</th>
                <th className="px-5 py-4 text-left">Thứ 4 (T4)</th>
                <th className="px-5 py-4 text-left">Thứ 5 (T5)</th>
                <th className="px-5 py-4 text-left">Thứ 6 (T6)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)] text-base align-top">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4 font-bold text-[var(--secondary)] text-sm align-middle">Tiết 1 (07:00 - 07:45)</td>
                <td className="px-5 py-4 align-middle">
                  <span className="font-bold text-indigo-700 block">Toán Học</span>
                  <span className="text-xs text-[var(--secondary)] block mt-0.5">Phòng 10A1</span>
                </td>
                <td className="px-5 py-4 align-middle">
                  <span className="font-bold text-emerald-700 block">Vật Lý</span>
                  <span className="text-xs text-[var(--secondary)] block mt-0.5">Phòng 10A1</span>
                </td>
                <td className="px-5 py-4 align-middle">
                  <span className="font-bold text-amber-700 block">Hóa Học</span>
                  <span className="text-xs text-[var(--secondary)] block mt-0.5">Phòng Lab 1</span>
                </td>
                <td className="px-5 py-4 align-middle">
                  <span className="font-bold text-purple-700 block">Tiếng Anh</span>
                  <span className="text-xs text-[var(--secondary)] block mt-0.5">Phòng 10A1</span>
                </td>
                <td className="px-5 py-4 align-middle">
                  <span className="font-bold text-rose-700 block">Ngữ Văn</span>
                  <span className="text-xs text-[var(--secondary)] block mt-0.5">Phòng 10A1</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4 font-bold text-[var(--secondary)] text-sm align-middle">Tiết 2 (07:55 - 08:40)</td>
                <td className="px-5 py-4 align-middle">
                  <span className="font-bold text-indigo-700 block">Toán Học</span>
                  <span className="text-xs text-[var(--secondary)] block mt-0.5">Phòng 10A1</span>
                </td>
                <td className="px-5 py-4 align-middle">
                  <span className="font-bold text-emerald-700 block">Vật Lý</span>
                  <span className="text-xs text-[var(--secondary)] block mt-0.5">Phòng 10A1</span>
                </td>
                <td className="px-5 py-4 align-middle">
                  <span className="font-bold text-blue-700 block">Lịch Sử</span>
                  <span className="text-xs text-[var(--secondary)] block mt-0.5">Phòng 10A1</span>
                </td>
                <td className="px-5 py-4 align-middle">
                  <span className="font-bold text-purple-700 block">Tiếng Anh</span>
                  <span className="text-xs text-[var(--secondary)] block mt-0.5">Phòng 10A1</span>
                </td>
                <td className="px-5 py-4 align-middle">
                  <span className="font-bold text-rose-700 block">Ngữ Văn</span>
                  <span className="text-xs text-[var(--secondary)] block mt-0.5">Phòng 10A1</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4 font-bold text-[var(--secondary)] text-sm align-middle">Tiết 3 (08:50 - 09:35)</td>
                <td className="px-5 py-4 align-middle">
                  <span className="font-bold text-cyan-700 block">Tin Học</span>
                  <span className="text-xs text-[var(--secondary)] block mt-0.5">Phòng Máy 2</span>
                </td>
                <td className="px-5 py-4 align-middle">
                  <span className="font-bold text-rose-700 block">Ngữ Văn</span>
                  <span className="text-xs text-[var(--secondary)] block mt-0.5">Phòng 10A1</span>
                </td>
                <td className="px-5 py-4 align-middle">
                  <span className="font-bold text-emerald-700 block">Sinh Học</span>
                  <span className="text-xs text-[var(--secondary)] block mt-0.5">Phòng 10A1</span>
                </td>
                <td className="px-5 py-4 align-middle">
                  <span className="font-bold text-indigo-700 block">Toán Học</span>
                  <span className="text-xs text-[var(--secondary)] block mt-0.5">Phòng 10A1</span>
                </td>
                <td className="px-5 py-4 align-middle">
                  <span className="font-bold text-amber-700 block">Thể Dục</span>
                  <span className="text-xs text-[var(--secondary)] block mt-0.5">Sân Trường</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
