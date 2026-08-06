"use client";

import { useStudentScoreSummaryQuery } from "@/features/scores/hooks/use-scores";

export function StudentGradesPanel({ studentId, canRead }: Readonly<{ studentId: string; canRead: boolean }>) {
  const query = useStudentScoreSummaryQuery(studentId, canRead);
  if (!canRead) return <Panel><p>Bạn không có quyền xem điểm số của học sinh này.</p></Panel>;
  if (query.isPending) return <Panel><p role="status">Đang tải điểm số...</p></Panel>;
  if (query.isError) return <Panel><p role="alert">Không thể tải điểm số.</p><button type="button" onClick={() => void query.refetch()}>Thử lại</button></Panel>;
  if (!query.data.subjects.length) return <Panel><p>Chưa có điểm số cho học sinh này.</p></Panel>;
  return <Panel><h2 className="text-xl font-extrabold">Kết quả học tập</h2><ul className="mt-4 divide-y">{query.data.subjects.map((subject) => <li key={subject.subject_id} className="grid gap-2 py-4 sm:grid-cols-[1fr_8rem_2fr]"><strong>{subject.subject_name}</strong><span>{subject.average_score ?? "Chưa có"}</span><span>{subject.teacher_comment ?? "Chưa có nhận xét"}</span></li>)}</ul></Panel>;
}

function Panel({ children }: Readonly<{ children: React.ReactNode }>) {
  return <section id="student-panel-grades" role="tabpanel" aria-labelledby="student-tab-grades" className="rounded-2xl border bg-white p-6">{children}</section>;
}
