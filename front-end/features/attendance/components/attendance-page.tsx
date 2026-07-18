"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { AdminShell, Icon } from "@/features/admin-shell";
import { ApiClientError } from "@/lib/api/schemas";
import {
  createAttendanceSession,
  listAttendanceSessions,
  updateAttendanceSession,
  type AttendanceSession,
  type AttendanceStatus,
} from "../service/attendance.client";
import { listStudents } from "@/features/students/service/students.client";

const statusOptions: Array<{
  value: AttendanceStatus;
  label: string;
  tone: string;
}> = [
  { value: "present", label: "Có mặt", tone: "bg-emerald-50 text-emerald-800" },
  { value: "late", label: "Đi muộn", tone: "bg-amber-50 text-amber-800" },
  { value: "excused", label: "Vắng có phép", tone: "bg-sky-50 text-sky-800" },
  {
    value: "absent",
    label: "Vắng không phép",
    tone: "bg-rose-50 text-rose-800",
  },
];

export function AttendancePage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [draftDate, setDraftDate] = useState("");
  const [draftClass, setDraftClass] = useState("");
  const [draftPeriod, setDraftPeriod] =
    useState<AttendanceSession["period"]>("morning");
  const [filters, setFilters] = useState({
    date: "",
    className: "",
    period: "morning" as AttendanceSession["period"],
  });
  const queryString = buildQuery(filters);
  const query = useQuery({
    queryKey: ["attendance", queryString],
    queryFn: () => listAttendanceSessions(queryString),
  });
  const selected = query.data?.items[0];
  const canManage =
    session?.user?.role === "super_admin" ||
    session?.user?.permissions?.includes("academics.attendance.manage");
  const [feedback, setFeedback] = useState("");
  function submitFilters(event: FormEvent) {
    event.preventDefault();
    setFilters({ date: draftDate, className: draftClass, period: draftPeriod });
  }

  return (
    <AdminShell
      title="Điểm danh"
      subtitle="Theo dõi và cập nhật trạng thái chuyên cần theo lớp, ngày và buổi học."
      activeHref="/admin/attendance"
    >
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-5 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
            Academics · Chuyên cần
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Sổ điểm danh theo buổi
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            Mỗi trạng thái được ghi nhận tường minh và lưu theo học sinh. Hệ
            thống không tự suy đoán tỷ lệ chuyên cần.
          </p>
        </div>
      </section>
      <form
        onSubmit={submitFilters}
        className="grid gap-4 rounded-2xl border border-[var(--outline-variant)] bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
      >
        <label className="grid gap-2 text-sm font-bold">
          Ngày điểm danh
          <input
            aria-label="Ngày điểm danh"
            type="date"
            value={draftDate}
            onChange={(e) => setDraftDate(e.target.value)}
            className="min-h-11 rounded-lg border border-[var(--outline-variant)] px-3 font-normal"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Lớp
          <input
            aria-label="Lớp"
            value={draftClass}
            onChange={(e) => setDraftClass(e.target.value)}
            placeholder="Ví dụ: 6A1"
            className="min-h-11 rounded-lg border border-[var(--outline-variant)] px-3 font-normal"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Buổi học
          <select
            aria-label="Buổi học"
            value={draftPeriod}
            onChange={(event) =>
              setDraftPeriod(event.target.value as AttendanceSession["period"])
            }
            className="min-h-11 rounded-lg border border-[var(--outline-variant)] bg-white px-3 font-normal"
          >
            <option value="morning">Buổi sáng</option>
            <option value="afternoon">Buổi chiều</option>
          </select>
        </label>
        <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 font-bold text-white">
          <Icon name="filter_alt" />
          Lọc điểm danh
        </button>
      </form>
      {query.isPending ? (
        <div
          role="status"
          className="rounded-2xl bg-[var(--surface-container)] p-8"
        >
          Đang tải điểm danh...
        </div>
      ) : null}
      {query.error ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900"
        >
          <strong>Không thể tải điểm danh</strong>
          <p className="mt-1 text-sm">{errorText(query.error)}</p>
        </div>
      ) : null}
      {!query.isPending && !query.error && !selected ? (
        canManage && filters.date && filters.className ? (
          <CreateSessionCard
            date={filters.date}
            className={filters.className}
            period={filters.period}
            created={async () => {
              setFeedback("Đã tạo buổi điểm danh.");
              await queryClient.invalidateQueries({ queryKey: ["attendance"] });
            }}
          />
        ) : (
          <div
            role="status"
            className="rounded-2xl border border-dashed border-[var(--outline-variant)] bg-white p-10 text-center"
          >
            <Icon
              name="fact_check"
              className="text-4xl text-[var(--primary)]"
            />
            <h2 className="mt-3 text-lg font-black">Chưa có buổi điểm danh</h2>
            <p className="mt-1 text-sm text-[var(--secondary)]">
              Chọn ngày và lớp để tạo buổi điểm danh mới.
            </p>
          </div>
        )
      ) : null}
      {selected ? (
        <>
          <Summary session={selected} />
          <AttendanceEditor
            key={selected.id}
            session={selected}
            canManage={Boolean(canManage)}
            saved={async () => {
              setFeedback("Đã lưu điểm danh.");
              await queryClient.invalidateQueries({ queryKey: ["attendance"] });
            }}
          />
        </>
      ) : null}
      <p aria-live="polite" className="text-sm font-bold text-emerald-700">
        {feedback}
      </p>
    </AdminShell>
  );
}

function CreateSessionCard({
  date,
  className,
  period,
  created,
}: Readonly<{
  date: string;
  className: string;
  period: AttendanceSession["period"];
  created: () => Promise<void>;
}>) {
  const create = useMutation({
    mutationFn: async () => {
      const students = await listStudents(
        `?class_name=${encodeURIComponent(className)}&is_active=true&page=1&page_size=100`,
      );
      if (!students.items.length) throw new Error("EMPTY_CLASS");
      return createAttendanceSession({
        date,
        class_name: className,
        period,
        records: students.items.map((student) => ({
          student_id: student.id,
          status: "present",
          note: null,
        })),
      });
    },
    onSuccess: created,
  });
  return (
    <section className="rounded-2xl border border-dashed border-[var(--primary)] bg-white p-6 text-center">
      <Icon name="fact_check" className="text-4xl text-[var(--primary)]" />
      <h2 className="mt-3 text-lg font-black">Tạo buổi điểm danh mới</h2>
      <p className="mt-1 text-sm text-[var(--secondary)]">
        {formatDate(date)} · Lớp {className}. Danh sách lấy từ học sinh đang
        học.
      </p>
      {create.error ? (
        <p role="alert" className="mt-3 text-sm font-bold text-rose-700">
          Không thể tạo buổi điểm danh. Kiểm tra lớp có học sinh đang học.
        </p>
      ) : null}
      <button
        type="button"
        disabled={create.isPending}
        onClick={() => create.mutate()}
        className="mt-5 min-h-11 rounded-lg bg-[var(--primary)] px-5 font-bold text-white disabled:opacity-50"
      >
        {create.isPending ? "Đang tạo..." : "Tạo buổi điểm danh"}
      </button>
    </section>
  );
}
function AttendanceEditor({
  session,
  canManage,
  saved,
}: {
  session: AttendanceSession;
  canManage: boolean;
  saved: () => Promise<void>;
}) {
  const [records, setRecords] = useState(session.records);
  const save = useMutation({
    mutationFn: () =>
      updateAttendanceSession(session.id, {
        records: records.map(({ student_id, status, note }) => ({
          student_id,
          status,
          note,
        })),
      }),
    onSuccess: saved,
  });
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--outline-variant)] bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-[var(--outline-variant)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black">
            Lớp {session.class_name} ·{" "}
            {session.period === "morning" ? "Buổi sáng" : "Buổi chiều"}
          </h2>
          <p className="text-sm text-[var(--secondary)]">
            {formatDate(session.date)} · {records.length} học sinh
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 font-bold text-white disabled:opacity-50"
          >
            <Icon name="save" />
            {save.isPending ? "Đang lưu..." : "Lưu điểm danh"}
          </button>
        ) : null}
      </div>
      <div className="divide-y divide-[var(--outline-variant)]">
        {records.map((record) => (
          <StudentRow
            key={record.id}
            record={record}
            disabled={!canManage}
            update={(patch) =>
              setRecords((items) =>
                items.map((item) =>
                  item.id === record.id ? { ...item, ...patch } : item,
                ),
              )
            }
          />
        ))}
      </div>
    </section>
  );
}
function Summary({ session }: { session: AttendanceSession }) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {statusOptions.map((option) => (
        <article
          key={option.value}
          className="rounded-xl border border-[var(--outline-variant)] bg-white p-4"
        >
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-black ${option.tone}`}
          >
            {option.label}
          </span>
          <p className="mt-3 text-2xl font-black">
            {option.label}: {session.counts[option.value]}
          </p>
        </article>
      ))}
    </section>
  );
}
function StudentRow({
  record,
  disabled,
  update,
}: {
  record: AttendanceSession["records"][number];
  disabled: boolean;
  update: (patch: Partial<AttendanceSession["records"][number]>) => void;
}) {
  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(210px,1fr)_220px_minmax(220px,1fr)] lg:items-center">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--primary-fixed)] font-black text-[var(--primary)]">
          {initials(record.student_name)}
        </span>
        <div>
          <p className="font-black">{record.student_name}</p>
          <p className="text-xs font-semibold text-[var(--secondary)]">
            {record.student_code} · Lớp {record.class_name}
          </p>
        </div>
      </div>
      <label className="grid gap-1 text-xs font-bold text-[var(--secondary)]">
        Trạng thái {record.student_name}
        <select
          aria-label={`Trạng thái ${record.student_name}`}
          disabled={disabled}
          value={record.status}
          onChange={(e) =>
            update({ status: e.target.value as AttendanceStatus })
          }
          className="min-h-11 rounded-lg border border-[var(--outline-variant)] bg-white px-3 text-sm font-bold text-[var(--foreground)]"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-xs font-bold text-[var(--secondary)]">
        Ghi chú {record.student_name}
        <input
          aria-label={`Ghi chú ${record.student_name}`}
          disabled={disabled}
          value={record.note ?? ""}
          onChange={(e) => update({ note: e.target.value || null })}
          placeholder="Thông tin bổ sung"
          className="min-h-11 rounded-lg border border-[var(--outline-variant)] px-3 text-sm font-normal text-[var(--foreground)]"
        />
      </label>
    </div>
  );
}
function buildQuery(filters: {
  date: string;
  className: string;
  period: AttendanceSession["period"];
}) {
  const params = new URLSearchParams();
  if (filters.date) params.set("date", filters.date);
  if (filters.className.trim())
    params.set("class_name", filters.className.trim());
  params.set("period", filters.period);
  params.set("page", "1");
  params.set("page_size", "20");
  return `?${params}`;
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
function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(
    new Date(`${value}T00:00:00`),
  );
}
function errorText(error: unknown) {
  return error instanceof ApiClientError && error.status === 403
    ? "Bạn không có quyền xem điểm danh."
    : "Dịch vụ điểm danh chưa sẵn sàng.";
}
