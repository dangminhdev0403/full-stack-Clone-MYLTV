"use client";

import Image from "next/image";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { AdminShell, Icon } from "@/features/admin-shell";
import { ApiClientError } from "@/lib/api/schemas";
import { getStudent, updateStudent, type StudentDetail, type StudentWritePayload } from "../service/students.client";

export function StudentDetailPage({ id }: { id: string }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["students", id], queryFn: () => getStudent(id) });
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState("");
  const actor = session?.user;
  const canManage = actor?.role === "super_admin" || actor?.permissions?.includes("students.manage");
  const mutation = useMutation({
    mutationFn: (payload: StudentWritePayload) => updateStudent(id, payload),
    onSuccess: async () => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["students", id] }), queryClient.invalidateQueries({ queryKey: ["students"] })]);
      setEditing(false); setConfirming(false); setFeedback("Đã cập nhật hồ sơ học sinh.");
    },
  });
  const student = query.data;
  const error = errorMessage(query.error);

  return <AdminShell activeHref="/admin/students" title={student?.full_name ?? "Hồ sơ học sinh"} subtitle="Hồ sơ quản trị học sinh từ Student Administration API.">
    <div aria-live="polite" className="sr-only">{feedback}</div>
    {error ? <ErrorState message={error} retry={() => void query.refetch()} /> : null}
    {query.isPending ? <LoadingState /> : null}
    {student ? <>
      <ProfileSummary student={student} canManage={Boolean(canManage)} onEdit={() => setEditing(true)} onStatus={() => setConfirming(true)} />
      <Tabs />
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <PersonalCard student={student} />
        <GuardianCard student={student} />
      </section>
      {editing ? <EditDialog student={student} pending={mutation.isPending} error={mutation.error} close={() => setEditing(false)} save={(payload) => mutation.mutate(payload)} /> : null}
      {confirming ? <ConfirmDialog student={student} pending={mutation.isPending} close={() => setConfirming(false)} confirm={() => mutation.mutate({ is_active: !student.is_active })} /> : null}
    </> : null}
  </AdminShell>;
}

function ProfileSummary({ student, canManage, onEdit, onStatus }: { student: StudentDetail; canManage: boolean; onEdit: () => void; onStatus: () => void }) {
  const cohort = student.cohort_start_year && student.cohort_end_year ? `Niên khóa ${student.cohort_start_year}-${student.cohort_end_year}` : "Niên khóa chưa cập nhật";
  return <section className="flex flex-col gap-6 rounded-2xl border border-[var(--outline-variant)] bg-white p-5 shadow-sm lg:flex-row lg:items-center">
    <div className="relative shrink-0">{student.avatar_url ? <Image src={student.avatar_url} alt={`Ảnh ${student.full_name}`} width={128} height={144} unoptimized className="h-36 w-32 rounded-xl object-cover" /> : <span className="grid h-36 w-32 place-items-center rounded-xl bg-[var(--primary-fixed)] text-3xl font-bold text-[var(--primary)]">{initials(student.full_name)}</span>}<span className="absolute -bottom-2 right-2 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold text-white">{student.class_name}</span></div>
    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="text-2xl font-bold sm:text-3xl">{student.full_name}</h2><Status active={student.is_active} /></div><p className="mt-3 text-sm text-[var(--secondary)]">Mã học sinh: <strong className="text-[var(--foreground)]">{student.code}</strong> · Khối {student.grade ?? "Chưa cập nhật"} · {cohort}</p>{canManage ? <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={onEdit} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white"><Icon name="edit" />Chỉnh sửa hồ sơ</button><button type="button" onClick={onStatus} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--outline-variant)] px-4 text-sm font-bold"><Icon name={student.is_active ? "lock" : "lock_open"} />{student.is_active ? "Ngừng học" : "Kích hoạt lại"}</button></div> : null}</div>
  </section>;
}

function Tabs() { return <nav aria-label="Các phần hồ sơ học sinh" className="flex gap-1 overflow-x-auto border-b border-[var(--outline-variant)]"><span className="shrink-0 border-b-2 border-[var(--primary)] px-4 py-3 text-sm font-bold text-[var(--primary)]">Thông tin cá nhân</span>{["Chuyên cần", "Điểm số", "Học phí", "Xe tuyến"].map((label) => <span key={label} title="Dữ liệu đang hoàn thiện" className="shrink-0 px-4 py-3 text-sm font-semibold text-[var(--secondary)] opacity-60">{label} · Đang hoàn thiện</span>)}</nav>; }

function PersonalCard({ student }: { student: StudentDetail }) { return <article className="rounded-2xl border border-[var(--outline-variant)] bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 text-xl font-bold"><Icon name="person" className="text-[var(--primary)]" />Lý lịch cá nhân</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Ngày sinh" value={student.date_of_birth ? formatDateOnly(student.date_of_birth) : "Chưa cập nhật"} /><Field label="Giới tính" value={genderLabel(student.gender)} /><Field label="Dân tộc" value={student.ethnicity ?? "Chưa cập nhật"} /><Field label="Nơi sinh" value={student.birth_place ?? "Chưa cập nhật"} /><div className="sm:col-span-2"><Field label="Địa chỉ thường trú" value={student.permanent_address ?? "Chưa cập nhật"} /></div><Field label="Trường" value={student.school_name} /><Field label="Cập nhật gần nhất" value={formatDateTime(student.updated_at)} /></dl></article>; }

function GuardianCard({ student }: { student: StudentDetail }) { const contacts = student.guardian_contacts ?? []; const emergency = contacts.filter((item) => item.is_emergency_contact); return <article className="rounded-2xl border border-[var(--outline-variant)] bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 text-xl font-bold"><Icon name="family_restroom" className="text-[var(--primary)]" />Thông tin phụ huynh</h2><div className="mt-5 space-y-3">{contacts.length ? contacts.map((contact, index) => <div key={contact.id ?? `${contact.relationship}-${index}`} className="rounded-xl bg-[var(--surface-low)] p-4"><p className="text-xs font-bold uppercase text-[var(--secondary)]">{relationshipLabel(contact.relationship, contact.relationship_label)}</p><p className="mt-1 font-bold">{contact.full_name}</p><a className="mt-1 inline-block text-sm font-semibold text-[var(--primary)]" href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a></div>) : <p className="text-sm text-[var(--secondary)]">Chưa cập nhật người giám hộ.</p>}</div>{emergency.length ? <div className="mt-5 rounded-xl bg-[var(--secondary-container)] p-4"><p className="text-xs font-bold uppercase text-[var(--primary)]">Liên hệ khẩn cấp</p>{emergency.map((item) => <p key={item.id ?? item.phone} className="mt-2 text-sm font-semibold">{relationshipLabel(item.relationship, item.relationship_label)}: {item.full_name} · {item.phone}</p>)}</div> : null}</article>; }

function EditDialog({ student, pending, error, close, save }: { student: StudentDetail; pending: boolean; error: unknown; close: () => void; save: (payload: StudentWritePayload) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const f = new FormData(event.currentTarget); const nullable = (name: string) => String(f.get(name) ?? "").trim() || null; save({ full_name: String(f.get("full_name")), code: String(f.get("code")), class_name: String(f.get("class_name")), grade: nullable("grade"), school_name: String(f.get("school_name")), date_of_birth: nullable("date_of_birth"), gender: (nullable("gender") as StudentDetail["gender"]), ethnicity: nullable("ethnicity"), birth_place: nullable("birth_place"), permanent_address: nullable("permanent_address"), cohort_start_year: nullable("cohort_start_year") ? Number(f.get("cohort_start_year")) : null, cohort_end_year: nullable("cohort_end_year") ? Number(f.get("cohort_end_year")) : null, guardian_contacts: student.guardian_contacts }); }
  return <div role="dialog" aria-modal="true" aria-labelledby="edit-student-title" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4"><form onSubmit={submit} className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex justify-between gap-4"><h2 id="edit-student-title" className="text-xl font-bold">Chỉnh sửa hồ sơ</h2><button type="button" onClick={close} aria-label="Đóng chỉnh sửa" className="grid size-11 place-items-center rounded-lg"><Icon name="close" /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Input name="full_name" label="Họ và tên" value={student.full_name} required /><Input name="code" label="Mã học sinh" value={student.code} required /><Input name="class_name" label="Lớp" value={student.class_name} required /><Input name="grade" label="Khối" value={student.grade ?? ""} /><Input name="school_name" label="Trường" value={student.school_name} required /><Input name="date_of_birth" type="date" label="Ngày sinh" value={student.date_of_birth ?? ""} /><label className="grid gap-2 text-sm font-semibold">Giới tính<select name="gender" defaultValue={student.gender ?? ""} className="min-h-11 rounded-lg border px-3 font-normal"><option value="">Chưa cập nhật</option><option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option></select></label><Input name="ethnicity" label="Dân tộc" value={student.ethnicity ?? ""} /><Input name="birth_place" label="Nơi sinh" value={student.birth_place ?? ""} /><Input name="permanent_address" label="Địa chỉ thường trú" value={student.permanent_address ?? ""} /><Input name="cohort_start_year" type="number" label="Năm bắt đầu niên khóa" value={student.cohort_start_year?.toString() ?? ""} /><Input name="cohort_end_year" type="number" label="Năm kết thúc niên khóa" value={student.cohort_end_year?.toString() ?? ""} /></div>{error ? <p role="alert" className="mt-4 text-sm font-semibold text-red-700">Không thể lưu hồ sơ. Vui lòng kiểm tra dữ liệu.</p> : null}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={close} className="min-h-11 rounded-lg border px-4 font-semibold">Hủy</button><button disabled={pending} className="min-h-11 rounded-lg bg-[var(--primary)] px-5 font-bold text-white disabled:opacity-50">{pending ? "Đang lưu..." : "Lưu thay đổi"}</button></div></form></div>;
}

function ConfirmDialog({ student, pending, close, confirm }: { student: StudentDetail; pending: boolean; close: () => void; confirm: () => void }) { return <div role="dialog" aria-modal="true" aria-labelledby="confirm-status-title" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6"><h2 id="confirm-status-title" className="text-xl font-bold">{student.is_active ? "Xác nhận ngừng học" : "Xác nhận kích hoạt lại"}</h2><p className="mt-3 text-sm text-[var(--secondary)]">Cập nhật trạng thái của {student.full_name}. Thao tác này có thể đảo ngược.</p><div className="mt-6 flex justify-end gap-3"><button onClick={close} className="min-h-11 rounded-lg border px-4 font-semibold">Hủy</button><button disabled={pending} onClick={confirm} className="min-h-11 rounded-lg bg-[var(--primary)] px-4 font-bold text-white">Xác nhận</button></div></div></div>; }
function Input({ label, name, value, type = "text", required = false }: { label: string; name: string; value: string; type?: string; required?: boolean }) { return <label className="grid gap-2 text-sm font-semibold">{label}<input name={name} type={type} defaultValue={value} required={required} className="min-h-11 rounded-lg border px-3 font-normal" /></label>; }
function Field({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-semibold text-[var(--secondary)]">{label}</dt><dd className="mt-1 break-words text-sm font-bold">{value}</dd></div>; }
function Status({ active }: { active: boolean }) { return <span className={`rounded-full px-3 py-1 text-xs font-bold ${active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{active ? "Đang học" : "Ngừng học"}</span>; }
function LoadingState() { return <section role="status" aria-label="Đang tải hồ sơ học sinh" className="h-48 animate-pulse rounded-2xl bg-[var(--surface-container)]"><span className="sr-only">Đang tải hồ sơ học sinh</span></section>; }
function ErrorState({ message, retry }: { message: string; retry: () => void }) { return <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900"><strong>Không thể tải hồ sơ</strong><p className="mt-1 text-sm">{message}</p><button onClick={retry} className="mt-3 min-h-11 rounded-lg border border-red-300 bg-white px-4 font-semibold">Thử lại</button></section>; }
function initials(name: string) { return name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join("").toUpperCase(); }
function formatDateOnly(value: string) { return new Intl.DateTimeFormat("vi-VN").format(new Date(`${value}T00:00:00`)); }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function genderLabel(value: StudentDetail["gender"]) { return value === "male" ? "Nam" : value === "female" ? "Nữ" : value === "other" ? "Khác" : "Chưa cập nhật"; }
function relationshipLabel(value: string, custom: string | null) { return custom ?? ({ father: "Bố", mother: "Mẹ", grandfather: "Ông", grandmother: "Bà", guardian: "Người giám hộ", other: "Người liên hệ" }[value] ?? value); }
function errorMessage(error: unknown) { if (!error) return ""; if (error instanceof ApiClientError) return error.status === 403 ? "Bạn không có quyền xem hồ sơ học sinh." : error.message; return "Không thể kết nối dịch vụ học sinh."; }
