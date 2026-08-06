"use client";

import Link from "next/link";
import { AdminShell } from "@/features/admin-shell";

export default function AdminServicesOverviewPage() {
  const serviceCards = [
    {
      title: "Bữa ăn & Suất ăn",
      href: "/admin/services/meals",
      icon: "restaurant",
      color: "bg-amber-600",
      description: "Thực đơn bán trú, gói ăn và danh sách đăng ký theo ngày.",
    },
    {
      title: "Xe buýt Đưa đón",
      href: "/admin/services/bus",
      icon: "directions_bus",
      color: "bg-blue-600",
      description: "Quản lý tuyến xe, điểm đón trả, phương tiện và tài xế.",
    },
    {
      title: "Câu lạc bộ Ngoại khóa",
      href: "/admin/services/clubs",
      icon: "groups",
      color: "bg-indigo-600",
      description: "Danh mục câu lạc bộ thể thao, học thuật và đăng ký tham gia.",
    },
    {
      title: "Khảo sát Ý kiến",
      href: "/admin/services/surveys",
      icon: "poll",
      color: "bg-teal-600",
      description: "Tạo và theo dõi các phiếu khảo sát ý kiến phụ huynh và học sinh.",
    },
    {
      title: "Đồng phục Nhà trường",
      href: "/admin/services/uniforms",
      icon: "checkroom",
      color: "bg-purple-600",
      description: "Sản phẩm đồng phục, kích cỡ, tồn kho và đơn hàng.",
    },
    {
      title: "Sự kiện & Hoạt động",
      href: "/admin/services/events",
      icon: "event",
      color: "bg-rose-600",
      description: "Tổ chức sự kiện toàn trường, truyền thông và đăng ký tham gia.",
    },
  ];

  return (
    <AdminShell
      title="Tổng quan Dịch vụ Học sinh"
      subtitle="Quản lý và vận hành toàn bộ dịch vụ phụ trợ nhà trường từ một trung tâm điều khiển."
      activeHref="/admin/services"
    >
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
              Student Services · Trung tâm Dịch vụ
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Dịch vụ Học sinh & Tiện ích Vận hành
            </h2>
            <p className="mt-2 text-base leading-relaxed text-white/90">
              Điều phối dịch vụ bán trú, xe buýt, câu lạc bộ, sự kiện và đồng phục.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className={`size-12 rounded-xl ${card.color} text-white grid place-items-center mb-4`}>
                <span className="material-symbols-outlined text-2xl">{card.icon}</span>
              </div>
              <h3 className="text-lg font-bold group-hover:text-[var(--primary)] transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-[var(--secondary)] mt-2 leading-relaxed">
                {card.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--outline-variant)] flex items-center justify-between text-xs font-bold text-[var(--primary)]">
              <span>Truy cập quản lý</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
