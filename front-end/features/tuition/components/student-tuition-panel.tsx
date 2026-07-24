"use client";
import { ApiClientError } from "@/lib/api/schemas";
import { useTuitionListQuery } from "../hooks/use-tuition";

export function StudentTuitionPanel({
  studentId,
  canRead,
}: {
  studentId: string;
  canRead: boolean;
}) {
  if (!canRead)
    return (
      <section
        id="student-panel-tuition"
        role="tabpanel"
        aria-labelledby="student-tab-tuition"
        className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950"
      >
        <h2 className="font-extrabold">Không có quyền truy cập</h2>
        <p className="mt-2 text-sm">
          Bạn không có quyền xem dữ liệu học phí của học sinh này.
        </p>
      </section>
    );
  return <StudentTuitionQuery studentId={studentId} />;
}
function StudentTuitionQuery({ studentId }: { studentId: string }) {
  const query = useTuitionListQuery(
    `?student_id=${encodeURIComponent(studentId)}&page=1&page_size=100`,
  );
  if (query.isPending)
    return (
      <section
        id="student-panel-tuition"
        role="tabpanel"
        aria-labelledby="student-tab-tuition"
        aria-label="Đang tải học phí"
        className="h-44 animate-pulse rounded-2xl bg-[var(--surface-container)]"
      />
    );
  if (query.error) {
    const forbidden =
      query.error instanceof ApiClientError && query.error.status === 403;
    return (
      <section
        id="student-panel-tuition"
        role="tabpanel"
        aria-labelledby="student-tab-tuition"
        className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-950"
      >
        <h2 className="font-extrabold">Không thể tải học phí</h2>
        <p className="mt-2 text-sm">
          {forbidden
            ? "Bạn không có quyền xem dữ liệu học phí của học sinh này."
            : "Dịch vụ học phí hiện không khả dụng."}
        </p>
        <button
          type="button"
          onClick={() => void query.refetch()}
          className="mt-4 min-h-11 rounded-xl border border-red-300 bg-white px-4 font-bold"
        >
          Thử lại
        </button>
      </section>
    );
  }
  const data = query.data;
  return (
    <section
      id="student-panel-tuition"
      role="tabpanel"
      aria-labelledby="student-tab-tuition"
      className="space-y-5"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="Phải thu" value={data.summary.amount_due} />
        <Summary label="Đã thu" value={data.summary.amount_paid} />
        <Summary
          label="Còn thiếu"
          value={data.summary.amount_outstanding}
          emphasis
        />
      </div>
      <div className="rounded-2xl border border-[var(--outline-variant)] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold">Các khoản học phí</h2>
          <span className="text-sm text-[var(--secondary)]">
            {data.total} khoản
          </span>
        </div>
        {data.items.length ? (
          <div className="mt-4 divide-y divide-[var(--outline-variant)]">
            {data.items.map((item) => (
              <article
                key={item.id}
                className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{item.title}</h3>
                    <Status status={item.status} />
                  </div>
                  <p className="mt-1 text-sm text-[var(--secondary)]">
                    {item.semester_name} · {item.academic_year_name}
                    {item.due_date ? ` · Hạn ${formatDate(item.due_date)}` : ""}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-right text-xs sm:text-sm">
                  <Money label="Phải thu" value={item.amount_due} />
                  <Money label="Đã thu" value={item.amount_paid} />
                  <Money label="Còn thiếu" value={item.amount_outstanding} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-xl bg-[var(--surface-low)] p-5 text-sm text-[var(--secondary)]">
            Học sinh chưa có khoản học phí nào.
          </p>
        )}
      </div>
    </section>
  );
}
function Summary({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${emphasis ? "border-orange-200 bg-orange-50" : "border-[var(--outline-variant)] bg-white"}`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--secondary)]">
        {label}
      </p>
      <p className="mt-2 text-xl font-extrabold">{formatMoney(value)}</p>
    </div>
  );
}
function Money({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[var(--secondary)]">{label}</p>
      <p className="mt-1 font-bold">{formatMoney(value)}</p>
    </div>
  );
}
function Status({
  status,
}: {
  status: "unpaid" | "partial" | "paid" | "waived";
}) {
  const labels = {
    unpaid: "Chưa thu",
    partial: "Thu một phần",
    paid: "Đã thu",
    waived: "Miễn",
  };
  return (
    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800">
      {labels[status]}
    </span>
  );
}
function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(`${value}T00:00:00`));
}
