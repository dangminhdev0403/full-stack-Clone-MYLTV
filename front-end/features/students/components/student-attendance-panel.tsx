"use client";

import { useStudentAttendanceQuery } from "@/features/attendance/hooks/use-attendance";

const labels = {
  present: "Có mặt",
  absent: "Vắng không phép",
  late: "Đi muộn",
  excused: "Vắng có phép",
} as const;

export function StudentAttendancePanel({
  studentId,
  canRead,
}: Readonly<{ studentId: string; canRead: boolean }>) {
  const query = useStudentAttendanceQuery(studentId, canRead);
  if (!canRead)
    return (
      <Panel>
        <p>Bạn không có quyền xem dữ liệu chuyên cần của học sinh này.</p>
      </Panel>
    );
  if (query.isPending)
    return (
      <Panel>
        <p role="status">Đang tải dữ liệu chuyên cần...</p>
      </Panel>
    );
  if (query.isError)
    return (
      <Panel>
        <p role="alert">Không thể tải dữ liệu chuyên cần.</p>
        <button
          type="button"
          onClick={() => void query.refetch()}
          className="mt-3 min-h-11 rounded-lg border px-4 font-semibold"
        >
          Thử lại
        </button>
      </Panel>
    );
  if (!query.data.history.length)
    return (
      <Panel>
        <p>Chưa có dữ liệu chuyên cần cho học sinh này.</p>
      </Panel>
    );
  return (
    <Panel>
      <h2 className="text-xl font-extrabold">Lịch sử chuyên cần</h2>
      <ul className="mt-4 divide-y divide-[var(--outline-variant)]">
        {query.data.history.map((item) => (
          <li
            key={`${item.date}-${item.period}`}
            className="grid gap-2 py-4 sm:grid-cols-[10rem_10rem_1fr]"
          >
            <time dateTime={item.date} className="font-semibold">
              {new Date(`${item.date}T00:00:00`).toLocaleDateString("vi-VN")}
            </time>
            <span className="font-bold">{labels[item.status]}</span>
            <span className="text-[var(--secondary)]">
              {item.note ?? "Không có ghi chú"}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Panel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <section
      id="student-panel-attendance"
      role="tabpanel"
      aria-labelledby="student-tab-attendance"
      className="rounded-2xl border border-[var(--outline-variant)] bg-white p-6 shadow-sm"
    >
      {children}
    </section>
  );
}