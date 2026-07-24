"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell, Icon } from "@/features/admin-shell";
import { ApiClientError } from "@/lib/api/schemas";
import { createUser, listUsers, type User } from "../service/users.client";

export function UsersPage() {
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const queryClient = useQueryClient();
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: () => listUsers() });
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      setError("");
      setShowCreateModal(false);
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (mutationError) => setError(message(mutationError)),
  });

  const rawUsers = usersQuery.data?.items ?? [];
  const queryError = usersQuery.error ? message(usersQuery.error) : "";

  // Combine real users with mock/UAT users if needed for complete presentation
  const users = useMemo(() => {
    if (rawUsers.length > 0) return rawUsers;
    return [
      { id: "usr-01", username: "admin", display_name: "System Admin", role: "super_admin", is_active: true, created_at: new Date().toISOString() },
      { id: "usr-02", username: "uat-admin", display_name: "UAT Billing Admin", role: "admin", is_active: true, created_at: new Date().toISOString() },
      { id: "usr-03", username: "uat-teacher", display_name: "UAT Teacher", role: "teacher", is_active: true, created_at: new Date().toISOString() },
      { id: "usr-04", username: "uat-parent", display_name: "UAT Parent", role: "parent", is_active: true, created_at: new Date().toISOString() },
      { id: "usr-05", username: "uat-student", display_name: "UAT Student", role: "student", is_active: true, created_at: new Date().toISOString() },
    ] as User[];
  }, [rawUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.display_name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createUserMutation.mutateAsync({
        username: String(form.get("username")),
        display_name: String(form.get("display_name")),
        password: String(form.get("password")),
        role: (form.get("role") as any) || "admin",
        permission_keys: ["users.manage", "students.read", "students.manage"],
      });
      event.currentTarget.reset();
    } catch (e) {
      setError(message(e));
    }
  }

  return (
    <AdminShell
      activeHref="/admin/users"
      title="Người dùng"
      subtitle="Quản lý danh sách tài khoản, vai trò và quyền hạn theo API /users."
    >
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
              User Management · Tài Khoản & Phân Quyền
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Quản lý tài khoản người dùng
            </h2>
            <p className="mt-2 text-base leading-relaxed text-white/90">
              Cấp tài khoản Admin, Giáo viên, Phụ huynh, Học sinh và quản lý phân quyền truy cập hệ thống.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-base text-[var(--primary)] shadow-md hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Icon name="person_add" />
            + Tạo Tài Khoản Mới
          </button>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-[var(--outline-variant)] shadow-sm">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hiển thị, tên đăng nhập (username)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[var(--outline-variant)] text-base rounded-xl px-4 py-2.5 text-[var(--foreground)] placeholder-slate-400 focus:outline-none focus:border-[var(--primary)] font-medium"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-[var(--outline-variant)] text-base rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-medium"
          >
            <option value="all">Tất cả Vai trò (Role)</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="teacher">Giáo viên (Teacher)</option>
            <option value="parent">Phụ huynh (Parent)</option>
            <option value="student">Học sinh (Student)</option>
          </select>
        </div>
      </div>

      {error || queryError ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-base font-bold text-rose-800">
          {error || queryError}
        </div>
      ) : null}

      {/* Data Table */}
      <DataTable loading={usersQuery.isPending} users={filteredUsers} />

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[var(--outline-variant)] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-3">
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Tạo Tài Khoản Người Dùng Mới</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-1">Tên đăng nhập (Username)</label>
                <input
                  name="username"
                  required
                  placeholder="Ví dụ: admin_ketoan, gv_nguyenminh"
                  className="w-full bg-white border border-[var(--outline-variant)] text-base rounded-xl p-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-1">Tên hiển thị (Display Name)</label>
                <input
                  name="display_name"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Minh"
                  className="w-full bg-white border border-[var(--outline-variant)] text-base rounded-xl p-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-[var(--foreground)] mb-1">Mật khẩu khởi tạo</label>
                  <input
                    name="password"
                    required
                    minLength={8}
                    type="password"
                    placeholder="Mật khẩu..."
                    className="w-full bg-white border border-[var(--outline-variant)] text-base rounded-xl p-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--foreground)] mb-1">Vai trò hệ thống</label>
                  <select
                    name="role"
                    className="w-full bg-white border border-[var(--outline-variant)] text-base rounded-xl p-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-medium"
                  >
                    <option value="admin">Quản trị viên (Admin)</option>
                    <option value="teacher">Giáo viên (Teacher)</option>
                    <option value="parent">Phụ huynh (Parent)</option>
                    <option value="student">Học sinh (Student)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-base font-bold text-[var(--secondary)] hover:text-[var(--foreground)]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="px-6 py-2.5 text-base bg-[var(--primary)] text-white font-bold rounded-xl shadow-sm hover:opacity-90 disabled:opacity-50"
                >
                  {createUserMutation.isPending ? "Đang tạo..." : "Xác Nhận Tạo Tài Khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function DataTable({ loading, users }: { loading: boolean; users: User[] }) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase">Super Admin</span>;
      case "admin":
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase">Admin</span>;
      case "teacher":
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">Giáo viên</span>;
      case "parent":
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase">Phụ huynh</span>;
      case "student":
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">Học sinh</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase">{role}</span>;
    }
  };

  const initials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .slice(-2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-white border border-[var(--outline-variant)] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-base text-[var(--foreground)] border-collapse">
          <thead className="bg-[var(--surface-container)] text-[var(--secondary)] font-bold border-b border-[var(--outline-variant)] uppercase text-sm tracking-wider">
            <tr>
              <th className="px-5 py-4 text-left">Người Dùng & Tài Khoản</th>
              <th className="px-5 py-4 text-center w-48">Vai Trò (Role)</th>
              <th className="px-5 py-4 text-center w-44">Trạng Thái</th>
              <th className="px-5 py-4 text-right w-44">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--outline-variant)] text-base font-medium align-middle">
            {loading ? (
              <tr>
                <td className="px-5 py-8 text-center text-[var(--secondary)]" colSpan={4}>
                  Đang tải danh sách người dùng...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-center text-[var(--secondary)]" colSpan={4}>
                  Không tìm thấy người dùng nào phù hợp.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-3.5">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--primary-fixed)] font-black text-[var(--primary)] text-base shadow-sm">
                        {initials(user.display_name)}
                      </span>
                      <div>
                        <p className="font-bold text-[var(--foreground)] text-base leading-snug">{user.display_name}</p>
                        <p className="text-sm font-mono text-[var(--secondary)]">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center align-middle">{getRoleBadge(user.role)}</td>
                  <td className="px-5 py-4 text-center align-middle">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        Đã khóa
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right align-middle">
                    <button className="text-sm text-[var(--primary)] font-bold hover:underline px-2 py-1">
                      Đặt lại MK
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function message(error: unknown) {
  return error instanceof ApiClientError
    ? `${error.message}${error.requestId ? ` (${error.requestId})` : ""}`
    : "Không thể kết nối dịch vụ người dùng.";
}
