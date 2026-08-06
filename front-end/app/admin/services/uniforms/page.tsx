"use client";

import { AdminShell } from "@/features/admin-shell";
import { useUniformsQuery } from "@/features/student-services/hooks/use-student-services";

export default function AdminUniformsPage() {
  const query = useUniformsQuery();
  const products = query.data?.products ?? [];

  return (
    <AdminShell
      title="Đồng phục & Vật dụng Học sinh"
      subtitle="Quản lý danh mục sản phẩm đồng phục, kích cỡ, tồn kho và đơn đăng ký cấp phát."
      activeHref="/admin/services/uniforms"
    >
      <section className="relative overflow-hidden rounded-2xl bg-purple-700 p-6 text-white shadow-sm sm:p-7">
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-200">
              Student Services · Đồng phục nhà trường
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Danh mục Đồng phục & Đơn hàng
            </h2>
            <p className="mt-2 text-base leading-relaxed text-purple-100">
              Theo dõi sản phẩm đồng phục chính thức và đơn đăng ký mua từ phụ huynh.
            </p>
          </div>
        </div>
      </section>

      {query.isPending ? (
        <div role="status" className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-sm text-[var(--secondary)]">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-purple-700 border-t-transparent mb-3" />
          Đang tải danh mục đồng phục...
        </div>
      ) : query.isError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p className="font-bold">Không thể tải sản phẩm đồng phục.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.length === 0 ? (
            <div className="col-span-3 bg-white border border-[var(--outline-variant)] p-8 rounded-2xl text-center text-[var(--secondary)] font-medium">
              Chưa có sản phẩm đồng phục nào.
            </div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="bg-white border border-[var(--outline-variant)] rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-purple-900">{p.name}</h3>
                  <span className="text-xs text-[var(--secondary)] font-mono block mt-1">ID: {p.id}</span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[var(--outline-variant)]">
                  <span className="text-xs font-bold text-[var(--secondary)] uppercase">Phiên bản / Size</span>
                  {p.variants.map((v, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="font-bold bg-purple-50 text-purple-800 px-2 py-0.5 rounded font-mono">
                        Size {v.size}
                      </span>
                      <strong className="text-purple-900">{v.price.toLocaleString("vi-VN")} VNĐ</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </AdminShell>
  );
}
