"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminShell } from "@/features/admin-shell";
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
      <section className="rounded-2xl bg-[var(--primary)] p-5 text-white shadow-sm sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
          Billing · Công nợ
        </p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">Quản lý học phí</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              Số liệu lấy trực tiếp từ các khoản thu đã ghi nhận. Thanh toán
              trực tuyến chưa nằm trong phạm vi này.
            </p>
          </div>
          {canManage ? (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="min-h-11 rounded-lg bg-white px-5 font-bold text-[var(--primary)]"
            >
              Tạo khoản thu
            </button>
          ) : null}
        </div>
      </section>
      <form
        onSubmit={filter}
        className="grid gap-4 rounded-2xl border border-[var(--outline-variant)] bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <label className="grid gap-2 text-sm font-bold">
          Lớp
          <input
            aria-label="Lớp"
            value={draftClass}
            onChange={(event) => setDraftClass(event.target.value)}
            className="min-h-11 rounded-lg border px-3 font-normal"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Trạng thái
          <select
            aria-label="Trạng thái"
            value={draftStatus}
            onChange={(event) => setDraftStatus(event.target.value)}
            className="min-h-11 rounded-lg border bg-white px-3 font-normal"
          >
            <option value="">Tất cả</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="min-h-11 rounded-lg bg-[var(--primary)] px-5 font-bold text-white">
          Lọc học phí
        </button>
      </form>
      {charges.isPending ? (
        <output className="rounded-2xl bg-[var(--surface-container)] p-8">
          Đang tải học phí...
        </output>
      ) : null}
      {charges.error ? (
        <div role="alert" className="rounded-2xl bg-rose-50 p-5 text-rose-900">
          {errorText(charges.error)}
        </div>
      ) : null}
      {charges.data ? (
        <>
          <Summary summary={charges.data.summary} />
          <section className="overflow-hidden rounded-2xl border border-[var(--outline-variant)] bg-white">
            <div className="divide-y divide-[var(--outline-variant)]">
              {charges.data.items.map((charge) => (
                <ChargeRow
                  key={charge.id}
                  charge={charge}
                  canManage={Boolean(canManage)}
                  edit={() => setEditing(charge)}
                />
              ))}
              {charges.data.items.length === 0 ? (
                <p className="p-10 text-center text-sm text-[var(--secondary)]">
                  Chưa có khoản thu phù hợp.
                </p>
              ) : null}
            </div>
          </section>
        </>
      ) : null}
      <p aria-live="polite" className="text-sm font-bold text-emerald-700">
        {feedback}
      </p>
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
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {[
        ["Phải thu", summary.amount_due],
        ["Đã thu", summary.amount_paid],
        ["Còn thiếu", summary.amount_outstanding],
      ].map(([label, value]) => (
        <article key={String(label)} className="rounded-xl border bg-white p-4">
          <p className="text-sm font-bold text-[var(--secondary)]">{label}</p>
          <p className="mt-2 text-2xl font-black">{money(Number(value))}</p>
        </article>
      ))}
    </section>
  );
}
function ChargeRow({
  charge,
  canManage,
  edit,
}: Readonly<{ charge: TuitionCharge; canManage: boolean; edit: () => void }>) {
  return (
    <article className="grid gap-4 p-4 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-center">
      <div>
        <p className="font-black">{charge.student_name}</p>
        <p className="text-xs text-[var(--secondary)]">
          {charge.student_code} · Lớp {charge.class_name}
        </p>
      </div>
      <div>
        <p className="font-bold">{charge.title}</p>
        <p className="text-xs text-[var(--secondary)]">
          {charge.semester_name} · {charge.academic_year_name}
        </p>
      </div>
      <div>
        <p className="font-black">{money(charge.amount_outstanding)}</p>
        <p className="text-xs text-[var(--secondary)]">
          {statusLabels[charge.status]}
        </p>
      </div>
      {canManage ? (
        <button
          type="button"
          aria-label={`Cập nhật ${charge.student_name}`}
          onClick={edit}
          className="min-h-11 rounded-lg border px-4 font-bold"
        >
          Cập nhật
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
    <Dialog title="Tạo khoản thu" close={close}>
      <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-1">
          Học sinh
          <select
            name="student_id"
            aria-label="Học sinh"
            required
            className="mt-1 min-h-11 w-full rounded-lg border bg-white px-3"
          >
            <option value="">Chọn học sinh</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name} · {student.code}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          Tên khoản thu
          <input
            name="title"
            aria-label="Tên khoản thu"
            required
            className="mt-1 min-h-11 w-full rounded-lg border px-3"
          />
        </label>
        <label className="grid gap-1">
          Số tiền phải thu
          <input
            name="amount_due"
            aria-label="Số tiền phải thu"
            type="number"
            min="0"
            step="1"
            required
            className="mt-1 min-h-11 w-full rounded-lg border px-3"
          />
        </label>
        <label className="grid gap-1">
          Hạn thanh toán
          <input
            name="due_date"
            type="date"
            className="mt-1 min-h-11 w-full rounded-lg border px-3"
          />
        </label>
        {mutation.error ? <p role="alert">Không thể tạo khoản thu.</p> : null}
        <button
          disabled={!semesterId || mutation.isPending}
          className="min-h-11 rounded-lg bg-[var(--primary)] px-5 font-bold text-white"
        >
          Lưu khoản thu
        </button>
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
      <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-1">
          Số tiền đã thu
          <input
            name="amount_paid"
            aria-label="Số tiền đã thu"
            type="number"
            min="0"
            max={charge.amount_due}
            step="1"
            defaultValue={charge.amount_paid}
            required
            className="mt-1 min-h-11 w-full rounded-lg border px-3"
          />
        </label>
        {mutation.error ? (
          <p role="alert">Không thể cập nhật khoản thu.</p>
        ) : null}
        <button className="min-h-11 rounded-lg bg-[var(--primary)] px-5 font-bold text-white">
          Lưu thay đổi
        </button>
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
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <dialog
        ref={dialogRef}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        aria-labelledby="tuition-dialog-title"
        aria-modal="true"
        className="m-0 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl backdrop:bg-black/40"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="tuition-dialog-title" className="text-xl font-black">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Đóng"
            onClick={close}
            className="size-11 rounded-lg border"
          >
            ×
          </button>
        </div>
        {children}
      </dialog>
    </div>
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
