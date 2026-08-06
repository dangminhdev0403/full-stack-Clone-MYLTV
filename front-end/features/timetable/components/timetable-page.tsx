"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin-shell";
import { useClassesQuery, useCurrentAcademicContextQuery } from "@/features/academic-structure/hooks/use-academic-structure";
import { useAdminTimetableQuery, useSaveTimetableMutation } from "../hooks/use-timetable";
import type { TimetableItem } from "../service/timetable.client";

const monday = () => {
  const date = new Date();
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
};

export function TimetablePage() {
  const context = useCurrentAcademicContextQuery();
  const yearId = context.data?.academic_year?.id;
  const semesterId = context.data?.semester?.id ?? "";
  const classes = useClassesQuery({ academic_year_id: yearId, is_active: true }, { enabled: Boolean(yearId) });
  const [selectedClassId, setSelectedClassId] = useState("");
  const [weekStart, setWeekStart] = useState(monday);
  const [draft, setDraft] = useState<TimetableItem[] | null>(null);
  const classId = selectedClassId || classes.data?.[0]?.id || "";
  const scope = { class_id: classId, semester_id: semesterId, week_start: weekStart };
  const timetable = useAdminTimetableQuery(scope, { enabled: Boolean(classId && semesterId) });
  const save = useSaveTimetableMutation();

  const schedules = draft ?? timetable.data?.schedules ?? [];

  const update = (index: number, field: keyof TimetableItem, value: string | number) =>
    setDraft((current) => (current ?? schedules).map((item, currentIndex) => currentIndex === index ? { ...item, [field]: value } : item));

  return (
    <AdminShell title="Thời khóa biểu" subtitle="Quản lý lịch học theo lớp, học kỳ và tuần." activeHref="/admin/timetable">
      <section className="rounded-2xl border border-[var(--outline-variant)] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-bold">Lớp
            <select aria-label="Lớp" value={classId} onChange={(event) => { setSelectedClassId(event.target.value); setDraft(null); }} className="mt-1 w-full rounded-xl border p-3">
              <option value="">Chọn lớp</option>
              {classes.data?.map((item) => <option key={item.id} value={item.id}>{item.display_name}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold">Học kỳ
            <input value={context.data?.semester?.display_name ?? "Chưa cấu hình"} disabled className="mt-1 w-full rounded-xl border p-3" />
          </label>
          <label className="text-sm font-bold">Tuần bắt đầu
            <input type="date" value={weekStart} onChange={(event) => { setWeekStart(event.target.value); setDraft(null); }} className="mt-1 w-full rounded-xl border p-3" />
          </label>
        </div>
      </section>

      {context.isPending || classes.isPending || timetable.isPending ? <p role="status" className="rounded-2xl bg-white p-8 text-center">Đang tải thời khóa biểu…</p> : null}
      {context.isError || classes.isError || timetable.isError ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">Không thể tải dữ liệu. <button className="underline" onClick={() => void timetable.refetch()}>Thử lại</button></div> : null}
      {!context.isPending && !context.data?.semester ? <p role="alert" className="rounded-2xl bg-amber-50 p-6">Chưa có học kỳ hiện tại.</p> : null}

      {classId && semesterId && !timetable.isPending && !timetable.isError ? <section className="rounded-2xl border border-[var(--outline-variant)] bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-bold">{schedules.length} tiết · {timetable.data?.assigned_students ?? 0} học sinh</p>
          <button type="button" className="rounded-xl border px-4 py-2 font-bold" onClick={() => setDraft([...schedules, { day_of_week: 1, period: 1, subject: "" }])}>Thêm tiết</button>
        </div>
        {schedules.length === 0 ? <p className="py-8 text-center text-[var(--secondary)]">Tuần này chưa có lịch học.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr><th className="p-2">Thứ</th><th className="p-2">Tiết</th><th className="p-2">Môn</th><th className="p-2">Giáo viên</th><th className="p-2">Phòng</th><th /></tr></thead><tbody>{schedules.map((item, index) => <tr key={`${index}-${item.day_of_week}-${item.period}`}>
          <td className="p-2"><input aria-label={`Thứ tiết ${index + 1}`} type="number" min="1" max="7" value={item.day_of_week} onChange={(event) => update(index, "day_of_week", Number(event.target.value))} className="w-20 rounded-lg border p-2" /></td>
          <td className="p-2"><input aria-label={`Số tiết ${index + 1}`} type="number" min="1" max="20" value={item.period} onChange={(event) => update(index, "period", Number(event.target.value))} className="w-20 rounded-lg border p-2" /></td>
          <td className="p-2"><input aria-label={`Môn ${index + 1}`} required value={item.subject} onChange={(event) => update(index, "subject", event.target.value)} className="w-full rounded-lg border p-2" /></td>
          <td className="p-2"><input aria-label={`Giáo viên ${index + 1}`} value={item.teacher ?? ""} onChange={(event) => update(index, "teacher", event.target.value)} className="w-full rounded-lg border p-2" /></td>
          <td className="p-2"><input aria-label={`Phòng ${index + 1}`} value={item.room ?? ""} onChange={(event) => update(index, "room", event.target.value)} className="w-full rounded-lg border p-2" /></td>
          <td className="p-2"><button aria-label={`Xóa tiết ${index + 1}`} className="text-red-700 underline" onClick={() => setDraft(schedules.filter((_, current) => current !== index))}>Xóa</button></td>
        </tr>)}</tbody></table></div>}
        {save.isError ? <p role="alert" className="mt-4 text-red-700">Không thể lưu thời khóa biểu. Kiểm tra dữ liệu rồi thử lại.</p> : null}
        <button disabled={save.isPending || schedules.some((item) => !item.subject.trim())} onClick={() => save.mutate({ ...scope, schedules })} className="mt-5 rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white disabled:opacity-50">{save.isPending ? "Đang lưu…" : "Lưu thời khóa biểu"}</button>
      </section> : null}
    </AdminShell>
  );
}
