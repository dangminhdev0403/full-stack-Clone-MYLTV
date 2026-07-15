"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/features/admin-shell";
import { ApiClientError } from "@/lib/api/schemas";
import { listStudents } from "../service/students.client";

export function StudentsPage() {
  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => listStudents(),
  });
  const students = studentsQuery.data?.items ?? [];
  const error = studentsQuery.error
    ? studentsQuery.error instanceof ApiClientError
      ? studentsQuery.error.message
      : "Không thể kết nối dịch vụ."
    : "";

  return <AdminShell activeHref="/admin/students" title="Học sinh" subtitle="Dữ liệu thật từ Student Administration API.">
    {error ? <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p> : null}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{studentsQuery.isPending ? <p>Đang tải...</p> : students.map((student) => <Link href={`/admin/students/${student.id}`} key={student.id} className="rounded-xl border bg-white p-5 shadow-sm hover:border-blue-500"><p className="text-xs font-bold uppercase text-blue-700">{student.code}</p><h2 className="mt-2 text-xl font-bold">{student.full_name}</h2><p className="mt-1 text-slate-600">{student.class_name} · Khối {student.grade ?? "-"}</p></Link>)}</div>
  </AdminShell>;
}
