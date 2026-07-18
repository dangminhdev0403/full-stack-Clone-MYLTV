import Image from "next/image";
import { Icon } from "@/features/admin-shell";
import type { StudentDetail } from "../service/students.client";

export function StudentProfileHeader({
  student,
  canManage,
  onEdit,
  onStatus,
}: {
  student: StudentDetail;
  canManage: boolean;
  onEdit: () => void;
  onStatus: () => void;
}) {
  const cohort =
    student.cohort_start_year && student.cohort_end_year
      ? `Niên khóa ${student.cohort_start_year}-${student.cohort_end_year}`
      : "Niên khóa chưa cập nhật";
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-[var(--outline-variant)] bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center">
      <div className="relative mx-auto shrink-0 lg:mx-0">
        {student.avatar_url ? (
          <Image
            src={student.avatar_url}
            alt={`Ảnh ${student.full_name}`}
            width={112}
            height={112}
            unoptimized
            className="size-28 rounded-2xl object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-28 place-items-center rounded-2xl bg-[var(--primary-fixed)] text-3xl font-extrabold text-[var(--primary)]"
          >
            {initials(student.full_name)}
          </span>
        )}
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold text-white">
          {student.class_name}
        </span>
      </div>
      <div className="min-w-0 flex-1 text-center lg:text-left">
        <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {student.full_name}
          </h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${student.is_active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}
          >
            {student.is_active ? "Đang học" : "Ngừng học"}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--secondary)]">
          Mã học sinh{" "}
          <strong className="text-[var(--foreground)]">{student.code}</strong>
          <span aria-hidden="true"> · </span>Khối{" "}
          {student.grade ?? "Chưa cập nhật"}
          <span aria-hidden="true"> · </span>
          {cohort}
        </p>
        <p className="text-sm leading-6 text-[var(--secondary)]">
          {student.school_name}
        </p>
        {canManage ? (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-bold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              <Icon name="edit" />
              Chỉnh sửa hồ sơ
            </button>
            <button
              type="button"
              onClick={onStatus}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--outline-variant)] bg-white px-5 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              <Icon name={student.is_active ? "lock" : "lock_open"} />
              {student.is_active ? "Ngừng học" : "Kích hoạt lại"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
