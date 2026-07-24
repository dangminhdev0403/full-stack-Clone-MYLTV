"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminShell, Icon } from "@/features/admin-shell";
import { useAcademicContextQuery } from "@/features/admin-shell/hooks/use-academic-context";
import { useStudentsQuery } from "@/features/students/hooks/use-students";
import { ApiClientError } from "@/lib/api/schemas";
import {
  type TuitionCharge,
  type TuitionStatus,
} from "../service/tuition.client";
import {
  useCreateTuitionMutation,
  useTuitionListQuery,
  useUpdateTuitionMutation,
} from "../hooks/use-tuition";

const statusConfig: Record<
  TuitionStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  unpaid: {
    label: "Chưa thanh toán",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200/60",
    dot: "bg-rose-500",
  },
  partial: {
    label: "Thanh toán một phần",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/60",
    dot: "bg-amber-500",
  },
  paid: {
    label: "Đã thanh toán",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/60",
    dot: "bg-emerald-500",
  },
  waived: {
    label: "Miễn học phí",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200/60",
    dot: "bg-purple-500",
  },
};

const statusLabels: Record<TuitionStatus, string> = {
  unpaid: "Chưa thanh toán",
  partial: "Thanh toán một phần",
  paid: "Đã thanh toán",
  waived: "Miễn học phí",
};

export function TuitionPage() {
  const { data: session } = useSession();
  const [draftClass, setDraftClass] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  const [filters, setFilters] = useState({ className: "", status: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<TuitionCharge | null>(null);
  const [feedback, setFeedback] = useState("");
  const queryString = buildQuery(filters);
  const charges = useTuitionListQuery(queryString);
  const context = useAcademicContextQuery();
  const students = useStudentsQuery("?is_active=true&page=1&page_size=100");
  const canManage = session?.user?.permissions?.includes(
    "billing.tuition.manage",
  );

  function filter(event: FormEvent) {
    event.preventDefault();
    setFilters({ className: draftClass.trim(), status: draftStatus });
  }

  return (
    <AdminShell
      title="Học phí"
      subtitle="Theo dõi khoản phải thu, đã thu và công nợ theo học sinh."
      activeHref="/admin/tuition"
    >
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-10 -top-10 size-60 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-200/90 uppercase">
            <Icon name="account_balance_wallet" className="text-[18px]" />
            <span>Billing · Công nợ học sinh</span>
          </div>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Quản lý học phí
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100/80">
                Số liệu lấy trực tiếp từ các khoản thu đã ghi nhận. Thanh toán
                trực tuyến chưa nằm trong phạm vi này.
              </p>
            </div>
            {canManage ? (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-6 font-bold text-blue-700 shadow-lg shadow-black/10 transition-all hover:bg-blue-50 active:scale-98 shrink-0"
              >
                <span aria-hidden="true">
                  <Icon name="add" className="text-[20px]" />
                </span>
                <span>Tạo khoản thu</span>
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* Filter Toolbar */}
      <form
        onSubmit={filter}
        className="grid gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
          Lớp học
          <div className="relative flex items-center">
            <span aria-hidden="true" className="absolute left-3">
              <Icon name="search" className="text-[18px] text-slate-400" />
            </span>
            <input
              aria-label="Lớp"
              placeholder="Nhập mã/tên lớp (VD: 10A1)"
              value={draftClass}
              onChange={(event) => setDraftClass(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-sm font-normal text-slate-800 transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </label>
        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
          Trạng thái thanh toán
          <select
            aria-label="Trạng thái"
            value={draftStatus}
            onChange={(event) => setDraftStatus(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-normal text-slate-800 transition-all focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-98">
          <span aria-hidden="true">
            <Icon name="tune" className="text-[18px]" />
          </span>
          <span>Lọc học phí</span>
        </button>
      </form>

      {/* Loading / Error States */}
      {charges.isPending ? (
        <output className="flex items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white p-12 text-sm font-medium text-slate-500 shadow-sm">
          <span className="size-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span>Đang tải danh sách học phí...</span>
        </output>
      ) : null}

      {charges.error ? (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-sm font-semibold text-rose-900 shadow-sm"
        >
          <Icon name="error" className="text-[22px] text-rose-600" />
          <span>{errorText(charges.error)}</span>
        </div>
      ) : null}

      {/* Content */}
      {charges.data ? (
        <>
          <Summary summary={charges.data.summary} />
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Danh sách khoản thu ({charges.data.items.length})</span>
                <span>Thông tin & Thao tác</span>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {charges.data.items.map((charge) => (
                <ChargeRow
                  key={charge.id}
                  charge={charge}
                  canManage={Boolean(canManage)}
                  edit={() => setEditing(charge)}
                />
              ))}
              {charges.data.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Icon name="receipt_long" className="text-[30px]" />
                  </div>
                  <p className="mt-3 font-semibold text-slate-700">
                    Không tìm thấy khoản thu nào
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Thử điều chỉnh bộ lọc lớp hoặc trạng thái để xem kết quả.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </>
      ) : null}

      <p aria-live="polite" className="text-sm font-bold text-emerald-700">
        {feedback}
      </p>

      {/* Dialog Modals */}
      {createOpen ? (
        <CreateDialog
          students={students.data?.items ?? []}
          semesterId={context.data?.semester.id ?? ""}
          close={() => setCreateOpen(false)}
          saved={() => {
            setFeedback("Đã tạo khoản thu.");
            setCreateOpen(false);
          }}
        />
      ) : null}
      {editing ? (
        <EditDialog
          charge={editing}
          close={() => setEditing(null)}
          saved={() => {
            setFeedback("Đã cập nhật khoản thu.");
            setEditing(null);
          }}
        />
      ) : null}
    </AdminShell>
  );
}

function Summary({
  summary,
}: Readonly<{
  summary: {
    amount_due: number;
    amount_paid: number;
    amount_outstanding: number;
  };
}>) {
  const collectionRate =
    summary.amount_due > 0
      ? Math.min(100, Math.round((summary.amount_paid / summary.amount_due) * 100))
      : 0;

  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <article className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tổng phải thu
          </p>
          <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon name="payments" className="text-[20px]" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-black text-slate-900">
          {money(Number(summary.amount_due))}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>Chỉ số công nợ kỳ này</span>
        </div>
      </article>

      <article className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Đã thu thực tế
          </p>
          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Icon name="check_circle" className="text-[20px]" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-black text-emerald-700">
          {money(Number(summary.amount_paid))}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-600">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
          <span>{collectionRate}%</span>
        </div>
      </article>

      <article className="relative overflow-hidden rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-600">
            Còn thiếu (Công nợ)
          </p>
          <div className="flex size-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Icon name="pending_actions" className="text-[20px]" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-black text-rose-600">
          {money(Number(summary.amount_outstanding))}
        </p>
        <div className="mt-3 text-xs font-medium text-rose-500">
          Cần hoàn tất thu hồi
        </div>
      </article>
    </section>
  );
}

function ChargeRow({
  charge,
  canManage,
  edit,
}: Readonly<{ charge: TuitionCharge; canManage: boolean; edit: () => void }>) {
  const status = statusConfig[charge.status] || statusConfig.unpaid;
  const initials = charge.student_name
    .split(" ")
    .slice(-2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <article className="grid gap-4 p-5 transition-colors hover:bg-slate-50/80 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-center">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
          {initials}
        </div>
        <div>
          <p className="font-bold text-slate-900">{charge.student_name}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            {charge.student_code} · <span className="text-slate-700">Lớp {charge.class_name}</span>
          </p>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{charge.title}</p>
        <p className="mt-0.5 text-xs text-slate-400">
          {charge.semester_name} · {charge.academic_year_name}
        </p>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <p className="text-base font-black text-slate-900">
            {money(charge.amount_outstanding)}
          </p>
          <span className="text-xs text-slate-400">/ {money(charge.amount_due)}</span>
        </div>
        <div className="mt-1">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${status.bg} ${status.text} ${status.border}`}
          >
            <span className={`size-1.5 rounded-full ${status.dot}`} />
            <span>{status.label}</span>
          </span>
        </div>
      </div>
      {canManage ? (
        <button
          type="button"
          aria-label={`Cập nhật ${charge.student_name}`}
          onClick={edit}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-700 active:scale-98"
        >
          <span aria-hidden="true">
            <Icon name="edit" className="text-[16px]" />
          </span>
          <span>Cập nhật</span>
        </button>
      ) : null}
    </article>
  );
}

function CreateDialog({
  students,
  semesterId,
  close,
  saved,
}: Readonly<{
  students: Array<{ id: string; code: string; full_name: string }>;
  semesterId: string;
  close: () => void;
  saved: () => void;
}>) {
  const createMutation = useCreateTuitionMutation();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createMutation.mutate(
      {
        student_id: String(form.get("student_id")),
        semester_id: semesterId,
        title: String(form.get("title")),
        amount_due: Number(form.get("amount_due")),
        amount_paid: 0,
        due_date: String(form.get("due_date")) || null,
        note: null,
        is_waived: false,
      },
      { onSuccess: saved },
    );
  }

  const mutation = createMutation;

  return (
    <Dialog title="Tạo khoản thu mới" close={close}>
      <form onSubmit={submit} className="grid gap-5">
        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
          Học sinh <span className="text-rose-500">*</span>
          <select
            name="student_id"
            aria-label="Học sinh"
            required
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-normal text-slate-800 transition-all focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Chọn học sinh thụ hưởng</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name} ({student.code})
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
          Tên khoản thu <span className="text-rose-500">*</span>
          <input
            name="title"
            aria-label="Tên khoản thu"
            placeholder="VD: Học phí Học kỳ 2"
            required
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm font-normal text-slate-800 transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
            Số tiền phải thu (VNĐ) <span className="text-rose-500">*</span>
            <input
              name="amount_due"
              aria-label="Số tiền phải thu"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              required
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm font-normal text-slate-800 transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
            Hạn thanh toán
            <input
              name="due_date"
              type="date"
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-normal text-slate-800 transition-all focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </label>
        </div>

        {mutation.error ? (
          <div role="alert" className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700">
            Không thể tạo khoản thu. Vui lòng kiểm tra lại thông tin.
          </div>
        ) : null}

        <div className="mt-2 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={close}
            className="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            disabled={!semesterId || mutation.isPending}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-98 disabled:opacity-50"
          >
            {mutation.isPending ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <span aria-hidden="true">
                <Icon name="check" className="text-[18px]" />
              </span>
            )}
            <span>Lưu khoản thu</span>
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function EditDialog({
  charge,
  close,
  saved,
}: Readonly<{ charge: TuitionCharge; close: () => void; saved: () => void }>) {
  const updateMutation = useUpdateTuitionMutation();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(new FormData(event.currentTarget).get("amount_paid"));
    updateMutation.mutate(
      { id: charge.id, payload: { amount_paid: amount } },
      { onSuccess: saved },
    );
  }

  const mutation = updateMutation;

  return (
    <Dialog title={`Cập nhật ${charge.student_name}`} close={close}>
      <div className="mb-4 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600">
        <div className="flex justify-between font-bold text-slate-800">
          <span>{charge.title}</span>
          <span>Phải thu: {money(charge.amount_due)}</span>
        </div>
        <div className="mt-1 flex justify-between text-slate-500">
          <span>Học sinh: {charge.student_code} (Lớp {charge.class_name})</span>
          <span>Đã thu trước đó: {money(charge.amount_paid)}</span>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-5">
        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
          Số tiền đã thu thực tế (VNĐ) <span className="text-rose-500">*</span>
          <div className="relative flex items-center">
            <input
              name="amount_paid"
              aria-label="Số tiền đã thu"
              type="number"
              min="0"
              max={charge.amount_due}
              step="1"
              defaultValue={charge.amount_paid}
              required
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-12 text-sm font-semibold text-slate-900 transition-all focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="absolute right-3.5 text-xs font-bold text-slate-400">
              VNĐ
            </span>
          </div>
        </label>

        {mutation.error ? (
          <div role="alert" className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700">
            Không thể cập nhật khoản thu. Vui lòng kiểm tra lại.
          </div>
        ) : null}

        <div className="mt-2 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={close}
            className="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            disabled={mutation.isPending}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-98 disabled:opacity-50"
          >
            {mutation.isPending ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <span aria-hidden="true">
                <Icon name="check" className="text-[18px]" />
              </span>
            )}
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function Dialog({
  title,
  close,
  children,
}: Readonly<{ title: string; close: () => void; children: React.ReactNode }>) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (dialog && typeof dialog.showModal === "function") dialog.showModal();
    else if (dialog) dialog.open = true;
    return () => previouslyFocused?.focus();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      aria-labelledby="tuition-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 m-auto h-fit w-full max-w-lg overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm"
    >
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <span aria-hidden="true">
                <Icon name="receipt" className="text-[22px]" />
              </span>
            </div>
            <h2 id="tuition-dialog-title" className="text-lg font-black tracking-tight text-slate-900">
              {title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={close}
            className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold transition-all hover:bg-slate-200 hover:text-slate-800 active:scale-95"
          >
            ×
          </button>
        </div>
        {children}
      </dialog>
    );
  }

function buildQuery(filters: { className: string; status: string }) {
  const params = new URLSearchParams({ page: "1", page_size: "20" });
  if (filters.className) params.set("class_name", filters.className);
  if (filters.status) params.set("status", filters.status);
  return `?${params}`;
}

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function errorText(error: unknown) {
  return error instanceof ApiClientError && error.status === 403
    ? "Bạn không có quyền xem học phí."
    : "Dịch vụ học phí chưa sẵn sàng.";
}
