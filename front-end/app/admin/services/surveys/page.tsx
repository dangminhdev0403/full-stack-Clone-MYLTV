"use client";

import { AdminShell } from "@/features/admin-shell";
import { useSurveysQuery } from "@/features/student-services/hooks/use-student-services";

export default function AdminSurveysPage() {
  const query = useSurveysQuery();
  const surveys = query.data?.surveys ?? [];

  return (
    <AdminShell
      title="Khảo sát & Ý kiến Phụ huynh / Học sinh"
      subtitle="Thu thập ý kiến đánh giá chất lượng dạy học, dịch vụ bán trú và hoạt động nhà trường."
      activeHref="/admin/services/surveys"
    >
      <section className="relative overflow-hidden rounded-2xl bg-teal-700 p-6 text-white shadow-sm sm:p-7">
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-200">
              Student Services · Khảo sát ý kiến
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Quản lý Khảo sát & Phản hồi
            </h2>
            <p className="mt-2 text-base leading-relaxed text-teal-100">
              Theo dõi danh sách các phiếu lấy ý kiến đóng mở theo thời hạn.
            </p>
          </div>
        </div>
      </section>

      {query.isPending ? (
        <div role="status" className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-sm text-[var(--secondary)]">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-teal-700 border-t-transparent mb-3" />
          Đang tải danh sách khảo sát...
        </div>
      ) : query.isError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p className="font-bold">Không thể tải danh sách khảo sát.</p>
        </div>
      ) : (
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-[var(--foreground)] border-collapse">
            <thead className="bg-[var(--surface-container)] text-[var(--secondary)] font-bold border-b border-[var(--outline-variant)] uppercase text-xs tracking-wider">
              <tr>
                <th className="px-5 py-4">Tên khảo sát</th>
                <th className="px-5 py-4">Mô tả</th>
                <th className="px-5 py-4">Hạn chót</th>
                <th className="px-5 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {surveys.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[var(--secondary)] font-medium">
                    Chưa có bài khảo sát nào.
                  </td>
                </tr>
              ) : (
                surveys.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-teal-800">{s.title}</td>
                    <td className="px-5 py-4 text-[var(--secondary)]">{s.description}</td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold">{s.deadline}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        s.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                      }`}>
                        {s.status === "active" ? "Đang mở" : s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
