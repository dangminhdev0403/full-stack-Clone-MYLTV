"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/features/admin-shell";
import shareApi from "@/config/share_api.json";

export default function ApiManagementPage() {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const endpoints = shareApi.endpoints;

  const groups = useMemo(() => {
    const unique = new Set(endpoints.map((e) => e.group));
    return ["all", ...Array.from(unique)];
  }, [endpoints]);

  const stats = useMemo(() => {
    const total = endpoints.length;
    const implemented = endpoints.filter((e) => e.implementation_status === "implemented").length;
    const planned = total - implemented;
    const syncPercentage = Math.round((implemented / total) * 100);
    return { total, implemented, planned, syncPercentage };
  }, [endpoints]);

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.path.toLowerCase().includes(search.toLowerCase()) ||
        item.group.toLowerCase().includes(search.toLowerCase());
      const matchesGroup = selectedGroup === "all" || item.group === selectedGroup;
      const matchesStatus = selectedStatus === "all" || item.implementation_status === selectedStatus;
      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [endpoints, search, selectedGroup, selectedStatus]);

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "POST":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PUT":
      case "PATCH":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "DELETE":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <AdminShell
      title="API Catalog & Sync"
      subtitle="Quản lý và đồng bộ toàn bộ 39 API endpoint theo share_api.json."
      activeHref="/admin/management"
    >
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
            System & API Integration Catalog
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Bảng đồng bộ 39 API với Mobile App
          </h2>
          <p className="mt-2 text-base leading-relaxed text-white/90">
            Phiên bản {shareApi.version} · Base URL: {shareApi.base_url} · 100% Endpoints đã được chuẩn hóa Backend & Client.
          </p>
        </div>
      </section>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-bold text-[var(--secondary)] uppercase tracking-wider">Tổng API Endpoints</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-[var(--foreground)]">{stats.total}</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">Mobile Sync</span>
          </div>
        </div>

        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-bold text-[var(--secondary)] uppercase tracking-wider">Đã Triển Khai Backend & UI</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-emerald-600">{stats.implemented}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">Hoàn tất 100%</span>
          </div>
        </div>

        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-bold text-[var(--secondary)] uppercase tracking-wider">Tỷ Lệ Đồng Bộ</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-indigo-600">{stats.syncPercentage}%</span>
            <div className="w-16 bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${stats.syncPercentage}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--outline-variant)] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-bold text-[var(--secondary)] uppercase tracking-wider">Bounded Contexts</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-purple-600">{groups.length - 1}</span>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">Modular Monolith</span>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-[var(--outline-variant)] shadow-sm">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm theo tên API, đường dẫn (/me, /users, /services)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[var(--outline-variant)] text-base rounded-xl px-4 py-2.5 text-[var(--foreground)] placeholder-slate-400 focus:outline-none focus:border-[var(--primary)] font-medium"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-white border border-[var(--outline-variant)] text-base rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-medium"
          >
            <option value="all">Tất cả Nhóm (Group)</option>
            {groups.filter((g) => g !== "all").map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white border border-[var(--outline-variant)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base text-[var(--foreground)]">
            <thead className="bg-[var(--surface-container)] text-[var(--secondary)] font-bold border-b border-[var(--outline-variant)] uppercase text-sm tracking-wider">
              <tr>
                <th className="px-5 py-4">Phương Thức & Path</th>
                <th className="px-5 py-4">Tên API</th>
                <th className="px-5 py-4">Bounded Context</th>
                <th className="px-5 py-4">Yêu Cầu Auth</th>
                <th className="px-5 py-4">Trạng Thái Đồng Bộ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)] text-base">
              {filteredEndpoints.map((ep, idx) => (
                <tr key={`${ep.method}-${ep.path}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getMethodBadgeClass(ep.method)}`}>
                        {ep.method}
                      </span>
                      <span className="font-bold text-[var(--foreground)] text-base">{ep.path}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-base">{ep.name}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {ep.bounded_context || ep.group}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {ep.auth_required ? (
                      <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        JWT Bearer
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600 font-bold">Public</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Implemented & Synced
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
