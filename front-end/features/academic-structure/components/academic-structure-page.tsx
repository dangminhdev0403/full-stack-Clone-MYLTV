"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin-shell";
import {
  useAcademicYearsQuery,
  useClassesQuery,
  useGradeLevelsQuery,
  usePromoteCohortMutation,
  useTransferStudentsMutation,
} from "../hooks/use-academic-structure";

export function AcademicStructurePage() {
  const [activeTab, setActiveTab] = useState<"structure" | "transfer">("structure");
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");

  // Transfer state
  const [transferStudentIdsText, setTransferStudentIdsText] = useState("");
  const [targetClassId, setTargetClassId] = useState("");
  const [transferReason, setTransferReason] = useState("");

  // Promotion state
  const [sourceClassId, setSourceClassId] = useState("");
  const [promoteTargetClassId, setPromoteTargetClassId] = useState("");

  const yearsQuery = useAcademicYearsQuery();
  const gradeLevelsQuery = useGradeLevelsQuery();
  const classesQuery = useClassesQuery({
    academic_year_id: selectedYearId || undefined,
    grade_level_id: selectedGradeId || undefined,
  });

  const transferMutation = useTransferStudentsMutation();
  const promoteMutation = usePromoteCohortMutation();

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const ids = transferStudentIdsText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length === 0 || !targetClassId) return;

    transferMutation.mutate({
      student_ids: ids,
      target_class_id: targetClassId,
      reason: transferReason || undefined,
    });
  };

  const handlePromote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceClassId || !promoteTargetClassId) return;

    promoteMutation.mutate({
      source_class_id: sourceClassId,
      target_class_id: promoteTargetClassId,
    });
  };

  const years = yearsQuery.data ?? [];
  const gradeLevels = gradeLevelsQuery.data ?? [];
  const classes = classesQuery.data ?? [];

  return (
    <AdminShell
      title="Cấu trúc học tập & Chuyển lớp"
      subtitle="Quản lý khối học, danh sách lớp và chuyển lớp / lên lớp đầu năm học."
      activeHref="/admin/academic-structure"
    >
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
              Academics · Tổ chức nhà trường
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Cấu trúc học tập & Danh sách Lớp
            </h2>
            <p className="mt-2 text-base leading-relaxed text-white/90">
              Quản lý danh mục Khối học, Lớp học và thực hiện chuyển lớp/thăng cấp học sinh transactionally.
            </p>
          </div>

          <div className="flex gap-2 bg-white/10 p-1.5 rounded-xl backdrop-blur">
            <button
              type="button"
              onClick={() => setActiveTab("structure")}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                activeTab === "structure"
                  ? "bg-white text-[var(--primary)] shadow-sm"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Danh sách Lớp học
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("transfer")}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                activeTab === "transfer"
                  ? "bg-white text-[var(--primary)] shadow-sm"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Chuyển lớp & Lên lớp
            </button>
          </div>
        </div>
      </section>

      {activeTab === "structure" ? (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 rounded-2xl border border-[var(--outline-variant)] bg-white p-5 shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="select-academic-year" className="block text-xs font-bold text-[var(--secondary)] uppercase tracking-wider mb-1.5">
                Năm học
              </label>
              <select
                id="select-academic-year"
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="w-full bg-[var(--surface-container)] border border-[var(--outline-variant)] text-sm rounded-xl px-3.5 py-2.5 font-medium"
              >
                <option value="">Tất cả năm học</option>
                {years.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.display_name} ({y.code}) {y.is_current ? "· Hiện tại" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label htmlFor="select-grade-level" className="block text-xs font-bold text-[var(--secondary)] uppercase tracking-wider mb-1.5">
                Khối học
              </label>
              <select
                id="select-grade-level"
                value={selectedGradeId}
                onChange={(e) => setSelectedGradeId(e.target.value)}
                className="w-full bg-[var(--surface-container)] border border-[var(--outline-variant)] text-sm rounded-xl px-3.5 py-2.5 font-medium"
              >
                <option value="">Tất cả khối học</option>
                {gradeLevels.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.display_name} ({g.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Classes Table */}
          {classesQuery.isPending ? (
            <div role="status" className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-sm text-[var(--secondary)]">
              <div className="mx-auto size-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent mb-3" />
              Đang tải danh sách lớp học...
            </div>
          ) : classesQuery.isError ? (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
              <p className="font-bold">Không thể tải cấu trúc lớp học.</p>
              <button
                type="button"
                onClick={() => void classesQuery.refetch()}
                className="mt-3 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="bg-white border border-[var(--outline-variant)] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[var(--foreground)] border-collapse">
                  <thead className="bg-[var(--surface-container)] text-[var(--secondary)] font-bold border-b border-[var(--outline-variant)] uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-5 py-4">Mã Lớp</th>
                      <th className="px-5 py-4">Tên Lớp</th>
                      <th className="px-5 py-4">Khối</th>
                      <th className="px-5 py-4">Năm Học</th>
                      <th className="px-5 py-4">GV Chủ Nhiệm</th>
                      <th className="px-5 py-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--outline-variant)]">
                    {classes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-[var(--secondary)] font-medium">
                          Chưa có lớp học nào được tạo phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      classes.map((cls) => (
                        <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-[var(--primary)]">{cls.code}</td>
                          <td className="px-5 py-4 font-bold">{cls.display_name}</td>
                          <td className="px-5 py-4 font-medium">{cls.grade_level?.display_name ?? cls.grade_level_id}</td>
                          <td className="px-5 py-4 font-medium">{cls.academic_year?.display_name ?? cls.academic_year_id}</td>
                          <td className="px-5 py-4 text-[var(--secondary)]">
                            {cls.homeroom_teacher?.display_name ?? "Chưa phân công"}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              cls.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                            }`}>
                              {cls.is_active ? "Hoạt động" : "Ngưng"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Transfer & Promotion Form Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Individual Transfer Card */}
          <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--primary)]">swap_horiz</span>
              Chuyển lớp học sinh
            </h3>
            <p className="text-sm text-[var(--secondary)] mb-5">
              Chuyển một hoặc nhiều học sinh sang lớp mới trong năm học.
            </p>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label htmlFor="transfer-student-ids" className="block text-xs font-bold text-[var(--secondary)] uppercase tracking-wider mb-1.5">
                  ID hoặc Mã học sinh (mỗi mã 1 dòng hoặc cách bởi dấu phẩy)
                </label>
                <textarea
                  id="transfer-student-ids"
                  rows={3}
                  value={transferStudentIdsText}
                  onChange={(e) => setTransferStudentIdsText(e.target.value)}
                  placeholder="Ví dụ: student-1, student-2"
                  className="w-full bg-[var(--surface-container)] border border-[var(--outline-variant)] text-sm rounded-xl p-3 font-mono"
                  required
                />
              </div>

              <div>
                <label htmlFor="transfer-target-class" className="block text-xs font-bold text-[var(--secondary)] uppercase tracking-wider mb-1.5">
                  Lớp học đích
                </label>
                <select
                  id="transfer-target-class"
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full bg-[var(--surface-container)] border border-[var(--outline-variant)] text-sm rounded-xl px-3.5 py-2.5 font-medium"
                  required
                >
                  <option value="">Chọn lớp đích...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.display_name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="transfer-reason" className="block text-xs font-bold text-[var(--secondary)] uppercase tracking-wider mb-1.5">
                  Lý do chuyển lớp (Tùy chọn)
                </label>
                <input
                  id="transfer-reason"
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="Ví dụ: Điều chuyển theo nguyện vọng gia đình"
                  className="w-full bg-[var(--surface-container)] border border-[var(--outline-variant)] text-sm rounded-xl px-3.5 py-2.5"
                />
              </div>

              {transferMutation.isSuccess ? (
                <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
                  Chuyển lớp thành công cho {transferMutation.data?.transferred_count ?? 0} học sinh!
                </div>
              ) : transferMutation.isError ? (
                <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-semibold">
                  Chuyển lớp thất bại. Vui lòng kiểm tra lại thông tin.
                </div>
              ) : null}

              <button
                type="submit"
                disabled={transferMutation.isPending}
                className="w-full bg-[var(--primary)] text-white font-bold px-4 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {transferMutation.isPending ? "Đang xử lý..." : "Xác nhận chuyển lớp"}
              </button>
            </form>
          </div>

          {/* Cohort Promotion Card */}
          <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--primary)]">trending_up</span>
              Thăng cấp & Lên lớp đầu năm
            </h3>
            <p className="text-sm text-[var(--secondary)] mb-5">
              Chuyển toàn bộ danh sách học sinh active từ lớp cũ sang lớp năm học mới.
            </p>

            <form onSubmit={handlePromote} className="space-y-4">
              <div>
                <label htmlFor="promote-source-class" className="block text-xs font-bold text-[var(--secondary)] uppercase tracking-wider mb-1.5">
                  Lớp nguồn (Lớp cũ)
                </label>
                <select
                  id="promote-source-class"
                  value={sourceClassId}
                  onChange={(e) => setSourceClassId(e.target.value)}
                  className="w-full bg-[var(--surface-container)] border border-[var(--outline-variant)] text-sm rounded-xl px-3.5 py-2.5 font-medium"
                  required
                >
                  <option value="">Chọn lớp nguồn...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.display_name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="promote-target-class" className="block text-xs font-bold text-[var(--secondary)] uppercase tracking-wider mb-1.5">
                  Lớp đích (Lớp năm học mới)
                </label>
                <select
                  id="promote-target-class"
                  value={promoteTargetClassId}
                  onChange={(e) => setPromoteTargetClassId(e.target.value)}
                  className="w-full bg-[var(--surface-container)] border border-[var(--outline-variant)] text-sm rounded-xl px-3.5 py-2.5 font-medium"
                  required
                >
                  <option value="">Chọn lớp đích...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.display_name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {promoteMutation.isSuccess ? (
                <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
                  Thăng cấp thành công cho {promoteMutation.data?.promoted_count ?? 0} học sinh!
                </div>
              ) : promoteMutation.isError ? (
                <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-semibold">
                  Thăng cấp thất bại. Vui lòng kiểm tra lại thông tin.
                </div>
              ) : null}

              <button
                type="submit"
                disabled={promoteMutation.isPending}
                className="w-full bg-[var(--primary)] text-white font-bold px-4 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {promoteMutation.isPending ? "Đang xử lý..." : "Xác nhận lên lớp tập thể"}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
