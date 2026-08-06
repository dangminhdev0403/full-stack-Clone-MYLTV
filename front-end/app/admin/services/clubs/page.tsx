"use client";

import { AdminShell } from "@/features/admin-shell";
import { useClubsQuery } from "@/features/student-services/hooks/use-student-services";

export default function AdminClubsPage() {
  const query = useClubsQuery();
  const clubs = query.data?.clubs ?? [];

  return (
    <AdminShell
      title="Câu lạc bộ & Hoạt động Ngoại khóa"
      subtitle="Quản lý các câu lạc bộ thể thao, nghệ thuật, STEM và đăng ký tham gia của học sinh."
      activeHref="/admin/services/clubs"
    >
      <section className="relative overflow-hidden rounded-2xl bg-indigo-700 p-6 text-white shadow-sm sm:p-7">
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-indigo-200">
              Student Services · Câu lạc bộ
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Danh sách Câu lạc bộ & Ngoại khóa
            </h2>
            <p className="mt-2 text-base leading-relaxed text-indigo-100">
              Quản lý danh mục CLB, lịch sinh hoạt hàng tuần và mức phí tham gia.
            </p>
          </div>
        </div>
      </section>

      {query.isPending ? (
        <div role="status" className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-sm text-[var(--secondary)]">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-indigo-700 border-t-transparent mb-3" />
          Đang tải danh sách câu lạc bộ...
        </div>
      ) : query.isError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p className="font-bold">Không thể tải danh sách câu lạc bộ.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clubs.length === 0 ? (
            <div className="col-span-2 bg-white border border-[var(--outline-variant)] p-8 rounded-2xl text-center text-[var(--secondary)] font-medium">
              Chưa có câu lạc bộ nào.
            </div>
          ) : (
            clubs.map((c) => (
              <div key={c.id} className="bg-white border border-[var(--outline-variant)] rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                      {c.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{c.status}</span>
                  </div>
                  <h3 className="text-lg font-bold mt-2">{c.name}</h3>
                  <p className="text-xs text-[var(--secondary)] mt-1 font-medium">Lịch học: {c.schedule}</p>
                </div>

                <div className="pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between">
                  <span className="text-sm font-black text-indigo-700">
                    {c.fee === 0 ? "Miễn phí" : `${c.fee.toLocaleString("vi-VN")} VNĐ`}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">ID: {c.id}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </AdminShell>
  );
}
