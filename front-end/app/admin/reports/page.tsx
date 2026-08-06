"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin-shell";
import { useAcademicYearsQuery, useClassesQuery } from "@/features/academic-structure/hooks/use-academic-structure";

export default function AdminReportsPage() {
  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  const yearsQuery = useAcademicYearsQuery();
  const classesQuery = useClassesQuery({ academic_year_id: selectedYearId || undefined });

  const years = yearsQuery.data ?? [];
  const classes = classesQuery.data ?? [];

  // Report mock metrics
  const attendanceRate = 97.4;
  const tuitionCollectionRate = 92.8;
  const totalStudents = 1248;
  const totalClasses = 36;

  // Monthly attendance trend dataset
  const attendanceTrend = [
    { month: "Tháng 1", rate: 96.5 },
    { month: "Tháng 2", rate: 97.1 },
    { month: "Tháng 3", rate: 98.0 },
    { month: "Tháng 4", rate: 97.4 },
    { month: "Tháng 5", rate: 96.8 },
    { month: "Tháng 6", rate: 97.9 },
  ];

  return (
    <AdminShell
      title="Báo cáo & Phân tích Vận hành"
      subtitle="Tổng hợp thống kê chuyên sâu về tình hình điểm danh, học phí và quy mô đào tạo toàn trường."
      activeHref="/admin/reports"
    >
      <section className="relative overflow-hidden rounded-2xl bg-teal-800 p-6 text-white shadow-sm sm:p-7">
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-200">
              Analytics · Báo cáo tổng hợp
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Báo cáo & Chỉ số Vận hành Nhà trường
            </h2>
            <p className="mt-2 text-base leading-relaxed text-teal-100">
              Trực quan hóa xu hướng tỷ lệ chuyên cần, thu học phí và phân bổ quy mô học sinh.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-2xl border border-[var(--outline-variant)] bg-white p-5 shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="report-academic-year" className="block text-xs font-bold text-[var(--secondary)] uppercase tracking-wider mb-1.5">
            Năm học
          </label>
          <select
            id="report-academic-year"
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
            className="w-full bg-[var(--surface-container)] border border-[var(--outline-variant)] text-sm rounded-xl px-3.5 py-2.5 font-medium"
          >
            <option value="">Tất cả năm học</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.display_name} ({y.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="report-school-class" className="block text-xs font-bold text-[var(--secondary)] uppercase tracking-wider mb-1.5">
            Lớp học
          </label>
          <select
            id="report-school-class"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full bg-[var(--surface-container)] border border-[var(--outline-variant)] text-sm rounded-xl px-3.5 py-2.5 font-medium"
          >
            <option value="">Toàn trường (Tất cả lớp)</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.display_name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--outline-variant)] p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-[var(--secondary)] uppercase tracking-wider block mb-1">
            Tổng số Học sinh
          </span>
          <strong className="text-2xl font-black text-slate-900">{totalStudents}</strong>
          <span className="block text-xs text-emerald-600 font-semibold mt-1">Hoạt động chính thức</span>
        </div>

        <div className="bg-white border border-[var(--outline-variant)] p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-[var(--secondary)] uppercase tracking-wider block mb-1">
            Tổng số Lớp học
          </span>
          <strong className="text-2xl font-black text-slate-900">{totalClasses} lớp</strong>
          <span className="block text-xs text-slate-500 font-semibold mt-1">Đang hoạt động</span>
        </div>

        <div className="bg-white border border-[var(--outline-variant)] p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-[var(--secondary)] uppercase tracking-wider block mb-1">
            Tỷ lệ Chuyên cần trung bình
          </span>
          <strong className="text-2xl font-black text-teal-700">{attendanceRate}%</strong>
          <span className="block text-xs text-teal-600 font-semibold mt-1">Cao hơn 1.2% so với kỳ trước</span>
        </div>

        <div className="bg-white border border-[var(--outline-variant)] p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-[var(--secondary)] uppercase tracking-wider block mb-1">
            Tỷ lệ Hoàn tất Học phí
          </span>
          <strong className="text-2xl font-black text-emerald-700">{tuitionCollectionRate}%</strong>
          <span className="block text-xs text-emerald-600 font-semibold mt-1">Đã quyết toán các đợt thu</span>
        </div>
      </div>

      {/* SVG Trend Chart Component */}
      <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-teal-700">trending_up</span>
          Xu hướng Tỷ lệ Chuyên cần theo Tháng
        </h3>

        {/* Native SVG Bar Chart */}
        <div className="h-64 w-full flex items-end justify-between gap-4 pt-6 pb-2 px-4 border-b border-[var(--outline-variant)]">
          {attendanceTrend.map((item, idx) => {
            const heightPercent = ((item.rate - 90) / 10) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-xs font-mono font-bold text-teal-800 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.rate}%
                </span>
                <div
                  style={{ height: `${Math.max(15, heightPercent)}%` }}
                  className="w-full max-w-[48px] bg-teal-600 rounded-t-lg group-hover:bg-teal-700 transition-colors shadow-sm"
                />
                <span className="text-xs font-semibold text-[var(--secondary)] whitespace-nowrap">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
