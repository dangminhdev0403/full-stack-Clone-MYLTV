"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin-shell";

export default function GradesAdminPage() {
  const [studentCode, setStudentCode] = useState("HS001");
  const [selectedTab, setSelectedTab] = useState<"scores" | "rewards">("scores");

  return (
    <AdminShell
      title="Điểm số"
      subtitle="Quản lý bảng điểm, nhận xét giáo viên và kết quả học tập theo API /students/:id/scores."
      activeHref="/admin/grades"
    >
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
              Academics · Điểm Số & Sổ Điểm
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Sổ điểm môn học & Khen thưởng
            </h2>
            <p className="mt-2 text-base leading-relaxed text-white/90">
              Nhập điểm miệng, 15 phút, giữa kỳ, cuối kỳ, tính điểm trung bình và cập nhật nhận xét giáo viên.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="Mã/ID Học sinh..."
              className="bg-white border border-[var(--outline-variant)] text-base rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-medium"
            />
            <button className="bg-white text-[var(--primary)] font-bold text-base px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap">
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-[var(--outline-variant)] pb-3">
        <button
          onClick={() => setSelectedTab("scores")}
          className={`px-5 py-2.5 text-base font-bold rounded-xl ${
            selectedTab === "scores"
              ? "bg-[var(--primary)] text-white"
              : "bg-white border border-[var(--outline-variant)] text-[var(--secondary)] hover:text-[var(--foreground)]"
          }`}
        >
          Bảng Điểm Môn Học
        </button>
        <button
          onClick={() => setSelectedTab("rewards")}
          className={`px-5 py-2.5 text-base font-bold rounded-xl ${
            selectedTab === "rewards"
              ? "bg-[var(--primary)] text-white"
              : "bg-white border border-[var(--outline-variant)] text-[var(--secondary)] hover:text-[var(--foreground)]"
          }`}
        >
          Khen Thưởng - Kỷ Luật
        </button>
      </div>

      {selectedTab === "scores" ? (
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base text-[var(--foreground)] border-collapse">
              <thead className="bg-[var(--surface-container)] text-[var(--secondary)] font-bold border-b border-[var(--outline-variant)] uppercase text-sm tracking-wider">
                <tr>
                  <th className="px-5 py-4 text-left w-44">Môn Học</th>
                  <th className="px-4 py-4 text-center w-36">Điểm Miệng</th>
                  <th className="px-4 py-4 text-center w-36">Điểm 15 Phút</th>
                  <th className="px-4 py-4 text-center w-28">Giữa Kỳ</th>
                  <th className="px-4 py-4 text-center w-28">Cuối Kỳ</th>
                  <th className="px-4 py-4 text-center w-32">Trung Bình</th>
                  <th className="px-5 py-4 text-left">Nhận Xét Giáo Viên</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-variant)] text-base font-medium align-middle">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-[var(--foreground)] align-middle">Toán Học</td>
                  <td className="px-4 py-4 text-center text-emerald-700 font-bold font-mono align-middle">8.0, 9.0</td>
                  <td className="px-4 py-4 text-center text-emerald-700 font-bold font-mono align-middle">8.5</td>
                  <td className="px-4 py-4 text-center text-emerald-700 font-bold font-mono align-middle">8.0</td>
                  <td className="px-4 py-4 text-center text-emerald-700 font-bold font-mono align-middle">9.0</td>
                  <td className="px-4 py-4 text-center text-indigo-700 font-extrabold text-lg font-mono align-middle">8.6</td>
                  <td className="px-5 py-4 text-[var(--foreground)] align-middle">Tiếp thu bài nhanh, tư duy logic tốt.</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-[var(--foreground)] align-middle">Ngữ Văn</td>
                  <td className="px-4 py-4 text-center text-emerald-700 font-bold font-mono align-middle">8.5, 8.0</td>
                  <td className="px-4 py-4 text-center text-emerald-700 font-bold font-mono align-middle">8.0</td>
                  <td className="px-4 py-4 text-center text-emerald-700 font-bold font-mono align-middle">8.5</td>
                  <td className="px-4 py-4 text-center text-emerald-700 font-bold font-mono align-middle">8.0</td>
                  <td className="px-4 py-4 text-center text-indigo-700 font-extrabold text-lg font-mono align-middle">8.2</td>
                  <td className="px-5 py-4 text-[var(--foreground)] align-middle">Viết văn giàu cảm xúc, phân tích sâu sắc.</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-[var(--foreground)] align-middle">Tiếng Anh</td>
                  <td className="px-4 py-4 text-center text-emerald-700 font-bold font-mono align-middle">9.0, 9.5</td>
                  <td className="px-4 py-4 text-center text-emerald-700 font-bold font-mono align-middle">9.0</td>
                  <td className="px-4 py-4 text-center text-emerald-700 font-bold font-mono align-middle">9.0</td>
                  <td className="px-4 py-4 text-center text-emerald-700 font-bold font-mono align-middle">9.5</td>
                  <td className="px-4 py-4 text-center text-indigo-700 font-extrabold text-lg font-mono align-middle">9.2</td>
                  <td className="px-5 py-4 text-[var(--foreground)] align-middle">Phát âm chuẩn, giao tiếp tự tin.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 text-sm font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                Khen Thưởng
              </span>
              <span className="text-sm text-[var(--secondary)] font-mono font-bold">2026-05-15</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mt-3">Học sinh giỏi Học kỳ 2</h3>
            <p className="text-base text-[var(--secondary)] mt-1.5 leading-relaxed">Tuyên dương đạt danh hiệu Học sinh Giỏi toàn diện năm học 2025-2026.</p>
            <span className="text-sm text-[var(--secondary)] block mt-4 font-medium">Cấp bởi: Ban Giám Hiệu</span>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
