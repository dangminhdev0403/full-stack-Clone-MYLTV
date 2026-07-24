"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin-shell";

export default function StudentServicesAdminPage() {
  const [activeTab, setActiveTab] = useState<"meals" | "events" | "surveys" | "clubs" | "bus" | "uniforms" | "coinfund">("meals");

  return (
    <AdminShell
      title="Bữa ăn & Dịch vụ"
      subtitle="Quản lý toàn bộ 7 dịch vụ tiện ích trên ứng dụng di động theo share_api.json."
      activeHref="/admin/services"
    >
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
            Student Services · Dịch Vụ
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Quản lý tiện ích dịch vụ học sinh
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            Đồng bộ dữ liệu suất ăn, sự kiện, khảo sát, câu lạc bộ, xe tuyến, đồng phục và quỹ xu tới App.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--outline-variant)] pb-3">
        {[
          { key: "meals", label: "Suất Ăn / Bán Trú" },
          { key: "events", label: "Sự Kiện Nhà Trường" },
          { key: "surveys", label: "Phiếu Khảo Sát" },
          { key: "clubs", label: "Câu Lạc Bộ" },
          { key: "bus", label: "Xe Tuyến & Tracking" },
          { key: "uniforms", label: "Đồng Phục & Đặt Hàng" },
          { key: "coinfund", label: "Quỹ Xu & Thưởng" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
              activeTab === tab.key
                ? "bg-[var(--primary)] text-white"
                : "bg-white border border-[var(--outline-variant)] text-[var(--secondary)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === "meals" && (
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Quản Lý Thực Đơn & Suất Ăn Bán Trú (/services/meals)</h2>
          <p className="text-sm text-[var(--secondary)]">Đồng bộ thực đơn hàng tuần và danh sách học sinh đăng ký suất ăn bán trú.</p>
          <div className="border border-[var(--outline-variant)] rounded-lg p-4 bg-[var(--surface-container)] font-mono text-xs text-[var(--foreground)]">
            GET /api/v1/services/meals | POST /api/v1/services/meals/register (Status: Implemented & Synced)
          </div>
        </div>
      )}

      {activeTab === "events" && (
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Quản Lý Sự Kiện & Hoạt Động Ngoại Khóa (/services/events)</h2>
          <p className="text-sm text-[var(--secondary)]">Tạo sự kiện, cài đặt hạn đăng ký và theo dõi danh sách phụ huynh/học sinh tham gia.</p>
          <div className="border border-[var(--outline-variant)] rounded-lg p-4 bg-[var(--surface-container)] font-mono text-xs text-[var(--foreground)]">
            GET /api/v1/services/events | POST /api/v1/services/events/:id/register (Status: Implemented & Synced)
          </div>
        </div>
      )}

      {activeTab === "surveys" && (
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Phiếu Khảo Sát Ý Kiến (/services/surveys)</h2>
          <p className="text-sm text-[var(--secondary)]">Tạo câu hỏi khảo sát dạng trắc nghiệm / đánh giá sao / tự luận và thu thập câu trả lời.</p>
          <div className="border border-[var(--outline-variant)] rounded-lg p-4 bg-[var(--surface-container)] font-mono text-xs text-[var(--foreground)]">
            GET /api/v1/services/surveys | POST /api/v1/services/surveys/:id/submit (Status: Implemented & Synced)
          </div>
        </div>
      )}

      {activeTab === "clubs" && (
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Quản Lý Câu Lạc Bộ Ngoại Khóa (/services/clubs)</h2>
          <p className="text-sm text-[var(--secondary)]">Danh sách các CLB thể thao, nghệ thuật, STEM và ghi nhận lượt đăng ký gia nhập.</p>
          <div className="border border-[var(--outline-variant)] rounded-lg p-4 bg-[var(--surface-container)] font-mono text-xs text-[var(--foreground)]">
            GET /api/v1/services/clubs | POST /api/v1/services/clubs/:id/register (Status: Implemented & Synced)
          </div>
        </div>
      )}

      {activeTab === "bus" && (
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Quản Lý Xe Tuyến & Định Vị Thời Gian Thực (/services/bus-tracking)</h2>
          <p className="text-sm text-[var(--secondary)]">Cập nhật tọa độ xe buýt, thông tin tài xế và điểm đón trả học sinh.</p>
          <div className="border border-[var(--outline-variant)] rounded-lg p-4 bg-[var(--surface-container)] font-mono text-xs text-[var(--foreground)]">
            GET /api/v1/students/:id/bus-route | GET /api/v1/services/bus-tracking (Status: Implemented & Synced)
          </div>
        </div>
      )}

      {activeTab === "uniforms" && (
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Đồng Phục & Đơn Đặt Mua (/services/uniforms)</h2>
          <p className="text-sm text-[var(--secondary)]">Danh mục áo quần đồng phục, bảng size và quản lý đơn hàng mua đồng phục mới.</p>
          <div className="border border-[var(--outline-variant)] rounded-lg p-4 bg-[var(--surface-container)] font-mono text-xs text-[var(--foreground)]">
            GET /api/v1/services/uniforms | POST /api/v1/services/uniforms/orders (Status: Implemented & Synced)
          </div>
        </div>
      )}

      {activeTab === "coinfund" && (
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Quản Lý Quỹ Xu & Điểm Thưởng (/services/coin-fund)</h2>
          <p className="text-sm text-[var(--secondary)]">Ghi nhận giao dịch nạp, nạp/rút xu và lịch sử biến động điểm thưởng của học sinh.</p>
          <div className="border border-[var(--outline-variant)] rounded-lg p-4 bg-[var(--surface-container)] font-mono text-xs text-[var(--foreground)]">
            GET /api/v1/services/coin-fund (Status: Implemented & Synced)
          </div>
        </div>
      )}
    </AdminShell>
  );
}
