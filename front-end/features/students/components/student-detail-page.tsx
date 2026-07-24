"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminShell, Icon } from "@/features/admin-shell";
import { StudentTuitionPanel } from "@/features/tuition/components/student-tuition-panel";
import { ApiClientError } from "@/lib/api/schemas";
import {
  type StudentDetail,
  type StudentWritePayload,
} from "../service/students.client";
import {
  useStudentDetailQuery,
  useUpdateStudentMutation,
} from "../hooks/use-students";
import {
  StudentDetailTabs,
  type StudentDetailTab,
} from "./student-detail-tabs";
import { StudentPlannedTabPanel } from "./student-planned-tab-panel";
import { StudentProfileHeader } from "./student-profile-header";
import { StudentProfilePanel } from "./student-profile-panel";

const validTabs = new Set<StudentDetailTab>([
  "profile",
  "attendance",
  "grades",
  "tuition",
  "transport",
]);

export function StudentDetailPage({ id }: Readonly<{ id: string }>) {
  const { data: session } = useSession();
  const query = useStudentDetailQuery(id);
  const [activeTab, setActiveTab] = useState<StudentDetailTab>(() => readTab());
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState("");
  const permissions = session?.user?.permissions ?? [];
  const canManage = permissions.includes("students.manage");
  const canReadTuition = permissions.includes("billing.tuition.read");
  const updateMutation = useUpdateStudentMutation();
  const mutation = {
    ...updateMutation,
    mutate: (payload: StudentWritePayload) =>
      updateMutation.mutate(
        { id, payload },
        {
          onSuccess: () => {
            setEditing(false);
            setConfirming(false);
            setFeedback("Đã cập nhật hồ sơ học sinh.");
          },
        },
      ),
  };
  useEffect(() => {
    const popState = () => setActiveTab(readTab());
    window.addEventListener("popstate", popState);
    return () => window.removeEventListener("popstate", popState);
  }, []);
  function selectTab(tab: StudentDetailTab) {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === "profile") url.searchParams.delete("tab");
    else url.searchParams.set("tab", tab);
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }
  const student = query.data;
  return (
    <AdminShell
      activeHref="/admin/students"
      title={student?.full_name ?? "Hồ sơ học sinh"}
      subtitle="Thông tin học sinh và các dịch vụ liên quan."
    >
      <div aria-live="polite" className="sr-only">
        {feedback}
      </div>
      {query.error ? (
        <ErrorState
          message={errorMessage(query.error)}
          retry={() => query.refetch()}
        />
      ) : null}
      {query.isPending ? <LoadingState /> : null}
      {student ? (
        <div className="space-y-5">
          <StudentProfileHeader
            student={student}
            canManage={canManage}
            onEdit={() => setEditing(true)}
            onStatus={() => setConfirming(true)}
          />
          <div className="overflow-hidden rounded-2xl border border-[var(--outline-variant)] bg-white shadow-sm">
            <StudentDetailTabs active={activeTab} onChange={selectTab} />
          </div>
          <ActiveStudentPanel
            tab={activeTab}
            student={student}
            canReadTuition={canReadTuition}
          />
          {editing ? (
            <EditDialog
              student={student}
              pending={mutation.isPending}
              error={mutation.error}
              close={() => setEditing(false)}
              save={(payload) => mutation.mutate(payload)}
            />
          ) : null}
          {confirming ? (
            <ConfirmDialog
              student={student}
              pending={mutation.isPending}
              close={() => setConfirming(false)}
              confirm={() => mutation.mutate({ is_active: !student.is_active })}
            />
          ) : null}
        </div>
      ) : null}
    </AdminShell>
  );
}

function ActiveStudentPanel({
  tab,
  student,
  canReadTuition,
}: Readonly<{
  tab: StudentDetailTab;
  student: StudentDetail;
  canReadTuition: boolean;
}>) {
  if (tab === "profile") return <StudentProfilePanel student={student} />;
  if (tab === "tuition")
    return (
      <StudentTuitionPanel studentId={student.id} canRead={canReadTuition} />
    );
  return <StudentPlannedTabPanel tab={tab} />;
}

function EditDialog({
  student,
  pending,
  error,
  close,
  save,
}: Readonly<{
  student: StudentDetail;
  pending: boolean;
  error: unknown;
  close: () => void;
  save: (payload: StudentWritePayload) => void;
}>) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const text = (name: string) => {
      const value = f.get(name);
      return typeof value === "string" ? value.trim() : "";
    };
    const nullable = (name: string) => text(name) || null;
    save({
      full_name: text("full_name"),
      code: text("code"),
      class_name: text("class_name"),
      grade: nullable("grade"),
      school_name: text("school_name"),
      date_of_birth: nullable("date_of_birth"),
      gender: nullable("gender") as StudentDetail["gender"],
      ethnicity: nullable("ethnicity"),
      birth_place: nullable("birth_place"),
      permanent_address: nullable("permanent_address"),
      cohort_start_year: nullable("cohort_start_year")
        ? Number(f.get("cohort_start_year"))
        : null,
      cohort_end_year: nullable("cohort_end_year")
        ? Number(f.get("cohort_end_year"))
        : null,
      guardian_contacts: student.guardian_contacts,
    });
  }
  return (
    <NativeDialog
      labelledBy="edit-student-title"
      close={close}
      className="max-w-3xl"
    >
      <form onSubmit={submit}>
        <div className="flex items-center justify-between gap-4">
          <h2 id="edit-student-title" className="text-xl font-extrabold">
            Chỉnh sửa hồ sơ
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Đóng chỉnh sửa"
            className="grid size-11 place-items-center rounded-xl hover:bg-[var(--surface-low)]"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input
            name="full_name"
            label="Họ và tên"
            value={student.full_name}
            required
          />
          <Input
            name="code"
            label="Mã học sinh"
            value={student.code}
            required
          />
          <Input
            name="class_name"
            label="Lớp"
            value={student.class_name}
            required
          />
          <Input name="grade" label="Khối" value={student.grade ?? ""} />
          <Input
            name="school_name"
            label="Trường"
            value={student.school_name}
            required
          />
          <Input
            name="date_of_birth"
            type="date"
            label="Ngày sinh"
            value={student.date_of_birth ?? ""}
          />
          <label className="grid gap-2 text-sm font-semibold">
            Giới tính
            <select
              name="gender"
              defaultValue={student.gender ?? ""}
              className="min-h-11 rounded-xl border px-3 font-normal"
            >
              <option value="">Chưa cập nhật</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </label>
          <Input
            name="ethnicity"
            label="Dân tộc"
            value={student.ethnicity ?? ""}
          />
          <Input
            name="birth_place"
            label="Nơi sinh"
            value={student.birth_place ?? ""}
          />
          <Input
            name="permanent_address"
            label="Địa chỉ thường trú"
            value={student.permanent_address ?? ""}
          />
          <Input
            name="cohort_start_year"
            type="number"
            label="Năm bắt đầu niên khóa"
            value={student.cohort_start_year?.toString() ?? ""}
          />
          <Input
            name="cohort_end_year"
            type="number"
            label="Năm kết thúc niên khóa"
            value={student.cohort_end_year?.toString() ?? ""}
          />
        </div>
        {error ? (
          <p role="alert" className="mt-4 text-sm font-semibold text-red-700">
            Không thể cập nhật hồ sơ.
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={close}
            className="min-h-11 rounded-xl border px-5 font-bold"
          >
            Hủy
          </button>
          <button
            disabled={pending}
            className="min-h-11 rounded-xl bg-[var(--primary)] px-5 font-bold text-white disabled:opacity-50"
          >
            {pending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </NativeDialog>
  );
}
function ConfirmDialog({
  student,
  pending,
  close,
  confirm,
}: {
  student: StudentDetail;
  pending: boolean;
  close: () => void;
  confirm: () => void;
}) {
  return (
    <NativeDialog
      labelledBy="confirm-status-title"
      close={close}
      className="max-w-md"
    >
      <h2 id="confirm-status-title" className="text-xl font-extrabold">
        {student.is_active ? "Xác nhận ngừng học" : "Xác nhận kích hoạt lại"}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--secondary)]">
        Cập nhật trạng thái của {student.full_name}. Thao tác này có thể đảo
        ngược.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={close}
          className="min-h-11 rounded-xl border px-5 font-bold"
        >
          Hủy
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={confirm}
          className="min-h-11 rounded-xl bg-[var(--primary)] px-5 font-bold text-white disabled:opacity-50"
        >
          Xác nhận
        </button>
      </div>
    </NativeDialog>
  );
}
function NativeDialog({
  children,
  labelledBy,
  close,
  className,
}: {
  children: React.ReactNode;
  labelledBy: string;
  close: () => void;
  className: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const active = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    if (dialog && typeof dialog.showModal === "function") dialog.showModal();
    else if (dialog) dialog.open = true;
    return () => active?.focus();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className={`fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl bg-white p-6 text-[var(--foreground)] shadow-2xl backdrop:bg-slate-950/55 ${className}`}
    >
      {children}
    </dialog>
  );
}
function Input({
  label,
  name,
  value,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        className="min-h-11 rounded-xl border px-3 font-normal"
      />
    </label>
  );
}
function LoadingState() {
  return (
    <section
      role="status"
      aria-label="Đang tải hồ sơ học sinh"
      className="h-48 animate-pulse rounded-2xl bg-[var(--surface-container)]"
    >
      <span className="sr-only">Đang tải hồ sơ học sinh</span>
    </section>
  );
}
function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <section
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900"
    >
      <strong>Không thể tải hồ sơ</strong>
      <p className="mt-1 text-sm">{message}</p>
      <button
        type="button"
        onClick={retry}
        className="mt-3 min-h-11 rounded-xl border border-red-300 bg-white px-4 font-bold"
      >
        Thử lại
      </button>
    </section>
  );
}
function errorMessage(error: unknown) {
  if (!error) return "";
  if (error instanceof ApiClientError)
    return error.status === 403
      ? "Bạn không có quyền xem hồ sơ học sinh."
      : error.message;
  return "Không thể kết nối dịch vụ học sinh.";
}
function readTab(): StudentDetailTab {
  if (typeof window === "undefined") return "profile";
  const candidate = new URLSearchParams(window.location.search).get(
    "tab",
  ) as StudentDetailTab | null;
  return candidate && validTabs.has(candidate) ? candidate : "profile";
}
