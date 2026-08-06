"use client";

import { AdminShell } from "@/features/admin-shell";
import { useBusQuery } from "@/features/student-services/hooks/use-student-services";

export default function AdminBusPage() {
  const query = useBusQuery();
  const bus = query.data;

  return (
    <AdminShell
      title="Dịch vụ Xe buýt Đưa đón"
      subtitle="Theo dõi lộ trình tuyến xe, điểm đón trả và thông tin tài xế phục vụ đưa đón."
      activeHref="/admin/services/bus"
    >
      <section className="relative overflow-hidden rounded-2xl bg-blue-700 p-6 text-white shadow-sm sm:p-7">
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-200">
              Student Services · Xe buýt trường học
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Quản lý Tuyến xe & Điểm đón
            </h2>
            <p className="mt-2 text-base leading-relaxed text-blue-100">
              Giám sát trạng thái lộ trình, xe và danh sách điểm dừng trên tuyến.
            </p>
          </div>
        </div>
      </section>

      {query.isPending ? (
        <div role="status" className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-sm text-[var(--secondary)]">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-blue-700 border-t-transparent mb-3" />
          Đang tải dữ liệu tuyến xe buýt...
        </div>
      ) : query.isError || !bus ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p className="font-bold">Không thể tải thông tin tuyến xe buýt.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[var(--outline-variant)] p-5 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-[var(--secondary)] uppercase tracking-wider block mb-1">
                Tên tuyến
              </span>
              <strong className="text-lg font-bold text-blue-700">{bus.route_name}</strong>
              <span className="block text-xs font-mono text-slate-500 mt-1">{bus.route_id}</span>
            </div>
            <div className="bg-white border border-[var(--outline-variant)] p-5 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-[var(--secondary)] uppercase tracking-wider block mb-1">
                Biển số xe
              </span>
              <strong className="text-lg font-bold font-mono">{bus.vehicle_plate}</strong>
            </div>
            <div className="bg-white border border-[var(--outline-variant)] p-5 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-[var(--secondary)] uppercase tracking-wider block mb-1">
                Tài xế phụ trách
              </span>
              <strong className="text-base font-bold">{bus.driver.name}</strong>
              <span className="block text-xs text-[var(--secondary)] font-mono">{bus.driver.phone}</span>
            </div>
          </div>

          <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-700">place</span>
              Danh sách Điểm đón / Trả trên tuyến
            </h3>

            <div className="divide-y divide-[var(--outline-variant)]">
              {bus.stops.map((stop) => (
                <div key={stop.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="size-7 grid place-items-center rounded-full bg-blue-100 text-blue-800 text-xs font-black">
                      {stop.sequence}
                    </span>
                    <div>
                      <strong className="block text-sm font-bold">{stop.name}</strong>
                      <span className="text-xs text-[var(--secondary)]">Dự kiến: {stop.estimated_at}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800">
                    {stop.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
