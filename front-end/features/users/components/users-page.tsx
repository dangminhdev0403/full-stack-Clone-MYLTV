"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/features/admin-shell";
import { ApiClientError } from "@/lib/api/schemas";
import { createUser, listUsers, type User } from "../service/users.client";

export function UsersPage() {
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: () => listUsers() });
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      setError("");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (mutationError) => setError(message(mutationError)),
  });
  const users = usersQuery.data?.items ?? [];
  const queryError = usersQuery.error ? message(usersQuery.error) : "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    try {
      await createUserMutation.mutateAsync({ username: String(form.get("username")), display_name: String(form.get("display_name")), password: String(form.get("password")), role: "admin", permission_keys: ["users.manage", "students.read", "students.manage"] });
      event.currentTarget.reset();
    } catch (e) { setError(message(e)); }
  }

  return <AdminShell activeHref="/admin/users" title="Người dùng" subtitle="Tài khoản và quyền được tải từ User Management API.">
    <form onSubmit={submit} className="grid gap-3 rounded-xl border bg-white p-5 md:grid-cols-4">
      <input name="username" required placeholder="Tên đăng nhập" className="rounded-lg border p-3" />
      <input name="display_name" required placeholder="Tên hiển thị" className="rounded-lg border p-3" />
      <input name="password" required minLength={8} type="password" placeholder="Mật khẩu ban đầu" className="rounded-lg border p-3" />
      <button className="rounded-lg bg-[#004ac6] px-4 font-bold text-white">Tạo admin</button>
    </form>
    {error || queryError ? <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error || queryError}</p> : null}
    <DataTable loading={usersQuery.isPending} users={users} />
  </AdminShell>;
}

function DataTable({ loading, users }: { loading: boolean; users: User[] }) {
  return <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left"><thead className="bg-slate-100"><tr><th className="p-4">Tài khoản</th><th className="p-4">Vai trò</th><th className="p-4">Trạng thái</th></tr></thead><tbody>
    {loading ? <tr><td className="p-5" colSpan={3}>Đang tải...</td></tr> : users.map((user) => <tr key={user.id} className="border-t"><td className="p-4"><strong>{user.display_name}</strong><br/><span className="text-sm text-slate-500">{user.username}</span></td><td className="p-4">{user.role}</td><td className="p-4">{user.is_active ? "Hoạt động" : "Đã khóa"}</td></tr>)}
  </tbody></table></div>;
}

function message(error: unknown) { return error instanceof ApiClientError ? `${error.message}${error.requestId ? ` (${error.requestId})` : ""}` : "Không thể kết nối dịch vụ."; }
