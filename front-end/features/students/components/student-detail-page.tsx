"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/features/admin-shell";
import { getStudent } from "../service/students.client";

export function StudentDetailPage({ id }: { id: string }) {
  const studentQuery = useQuery({
    queryKey: ["students", id],
    queryFn: () => getStudent(id),
  });
  const student = studentQuery.data;
  const error = studentQuery.error ? "Không tải được hồ sơ học sinh." : "";

  return <AdminShell activeHref="/admin/students" title={student?.full_name ?? "Hồ sơ học sinh"} subtitle="Chi tiết từ Student Administration API.">{error ? <p role="alert">{error}</p> : student ? <dl className="grid gap-4 rounded-xl border bg-white p-6 sm:grid-cols-2"><Field label="Mã học sinh" value={student.code}/><Field label="Lớp" value={student.class_name}/><Field label="Khối" value={student.grade ?? "-"}/><Field label="Trường" value={student.school_name}/></dl> : <p>Đang tải...</p>}</AdminShell>;
}
function Field({ label, value }: { label: string; value: string }) { return <div><dt className="text-sm text-slate-500">{label}</dt><dd className="font-bold">{value}</dd></div>; }
