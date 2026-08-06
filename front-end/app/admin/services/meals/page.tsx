"use client";

import { AdminShell } from "@/features/admin-shell";
import { useMealsQuery } from "@/features/student-services/hooks/use-student-services";

export default function AdminMealsPage() {
  const query = useMealsQuery();
  const menus = query.data?.menus ?? [];
  const pkg = query.data?.package;

  return (
    <AdminShell
      title="Dịch vụ Bữa ăn & Thực đơn"
      subtitle="Quản lý suất ăn bán trú, thực đơn hàng ngày và đăng ký suất ăn của học sinh."
      activeHref="/admin/services/meals"
    >
      <section className="relative overflow-hidden rounded-2xl bg-amber-600 p-6 text-white shadow-sm sm:p-7">
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">
              Student Services · Suất ăn bán trú
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Thực đơn & Đăng ký Suất ăn
            </h2>
            <p className="mt-2 text-base leading-relaxed text-amber-100">
              Theo dõi danh sách suất ăn đã đăng ký và thực đơn theo từng ngày trong tuần.
            </p>
          </div>
        </div>
      </section>

      {pkg ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[var(--outline-variant)] p-5 rounded-2xl shadow-sm">
            <span className="text-xs font-bold text-[var(--secondary)] uppercase tracking-wider block mb-1">
              Gói bán trú
            </span>
            <strong className="text-lg font-bold">{pkg.name}</strong>
          </div>
          <div className="bg-white border border-[var(--outline-variant)] p-5 rounded-2xl shadow-sm">
            <span className="text-xs font-bold text-[var(--secondary)] uppercase tracking-wider block mb-1">
              Số suất ăn còn lại
            </span>
            <strong className="text-2xl font-black text-amber-600">{pkg.remaining_meals} suất</strong>
          </div>
          <div className="bg-white border border-[var(--outline-variant)] p-5 rounded-2xl shadow-sm">
            <span className="text-xs font-bold text-[var(--secondary)] uppercase tracking-wider block mb-1">
              Trạng thái gói
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {pkg.status === "active" ? "Hoạt động" : pkg.status}
            </span>
          </div>
        </div>
      ) : null}

      {query.isPending ? (
        <div role="status" className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-sm text-[var(--secondary)]">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent mb-3" />
          Đang tải thực đơn bán trú...
        </div>
      ) : query.isError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p className="font-bold">Không thể tải danh sách suất ăn.</p>
        </div>
      ) : (
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-[var(--foreground)] border-collapse">
            <thead className="bg-[var(--surface-container)] text-[var(--secondary)] font-bold border-b border-[var(--outline-variant)] uppercase text-xs tracking-wider">
              <tr>
                <th className="px-5 py-4">Ngày</th>
                <th className="px-5 py-4">Thứ</th>
                <th className="px-5 py-4">Món chính</th>
                <th className="px-5 py-4">Món tráng miệng / Phụ</th>
                <th className="px-5 py-4">Đăng ký</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {menus.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[var(--secondary)] font-medium">
                    Chưa có lịch suất ăn nào.
                  </td>
                </tr>
              ) : (
                menus.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-mono font-bold">{m.date}</td>
                    <td className="px-5 py-4 font-semibold text-[var(--primary)]">{m.day_label}</td>
                    <td className="px-5 py-4 font-bold">{m.main_dish}</td>
                    <td className="px-5 py-4 text-[var(--secondary)]">{m.dessert ?? "-"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        m.registration_status === "registered" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                      }`}>
                        {m.registration_status === "registered" ? "Đã đăng ký" : "Chưa đăng ký"}
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
