"use client";

import { useStudentTransportQuery } from "../hooks/use-student-transport";

export function StudentTransportPanel({ studentId, canRead }: Readonly<{ studentId: string; canRead: boolean }>) {
  const query = useStudentTransportQuery(studentId, canRead);
  if (!canRead) return <Panel><p>Bạn không có quyền xem thông tin xe tuyến của học sinh này.</p></Panel>;
  if (query.isPending) return <Panel><p role="status">Đang tải thông tin xe tuyến...</p></Panel>;
  if (query.isError) return <Panel><p role="alert">Không thể tải thông tin xe tuyến.</p><button type="button" onClick={() => void query.refetch()}>Thử lại</button></Panel>;
  if (!query.data.route_id) return <Panel><p>Học sinh chưa được phân tuyến xe.</p></Panel>;
  return <Panel><h2 className="text-xl font-extrabold">{query.data.route_name}</h2><dl className="mt-4 grid gap-3 sm:grid-cols-2"><div><dt>Biển số xe</dt><dd className="font-bold">{query.data.bus_plate ?? "Chưa cập nhật"}</dd></div><div><dt>Điểm đón</dt><dd>{query.data.pickup_point ?? "Chưa cập nhật"}</dd></div><div><dt>Điểm trả</dt><dd>{query.data.dropoff_point ?? "Chưa cập nhật"}</dd></div><div><dt>Tài xế</dt><dd>{query.data.driver_name ?? "Chưa cập nhật"}</dd></div></dl></Panel>;
}

function Panel({ children }: Readonly<{ children: React.ReactNode }>) {
  return <section id="student-panel-transport" role="tabpanel" aria-labelledby="student-tab-transport" className="rounded-2xl border bg-white p-6">{children}</section>;
}