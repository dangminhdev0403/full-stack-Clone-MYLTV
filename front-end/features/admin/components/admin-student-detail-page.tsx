import Link from "next/link";
import { attendanceMock, gradebookMock, studentsMock, tuitionMock } from "../data/admin-pages.mock";
import { AdminShell, Icon } from "./admin-shell";

export function AdminStudentDetailPage({ studentId }: { studentId: string }) {
  const student = studentsMock.find((item) => item.id === studentId) ?? studentsMock[0];
  const tuition = tuitionMock.find((item) => item.student === student.name) ?? tuitionMock[0];

  return (
    <AdminShell
      activeHref="/admin/students"
      title={`Hồ sơ ${student.name}`}
      subtitle="Trang chi tiết học sinh theo mẫu Stitch, gom học vụ, chuyên cần, điểm số và học phí trong một hồ sơ quản trị."
    >
      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <article className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="grid size-20 place-items-center rounded-2xl bg-[#dbe1ff] text-2xl font-bold text-[#004ac6]">{student.name.slice(0, 2)}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#004ac6]">{student.code}</p>
                <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#191b23]">{student.name}</h2>
                <p className="mt-1 text-sm text-[#505f76]">Lớp {student.className} - Phụ huynh {student.guardian}</p>
              </div>
              <Link href="/admin/students" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#c3c6d7] px-4 text-sm font-bold text-[#505f76] hover:bg-[#e1e2ed] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]">
                Quay lại danh sách
              </Link>
            </div>
          </article>

          <section className="grid gap-5 md:grid-cols-3">
            <Metric label="Chuyên cần" value={student.attendance} icon="how_to_reg" />
            <Metric label="Điểm trung bình" value={student.gpa} icon="grade" />
            <Metric label="Công nợ" value={student.balance} icon="payments" />
          </section>

          <article className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#191b23]">Diễn biến học tập</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {gradebookMock.slice(0, 3).map((row) => (
                <div key={row.student} className="rounded-lg border border-[#e1e2ed] bg-[#f8fafc] p-4">
                  <p className="text-sm font-bold text-[#191b23]">{row.student === student.name ? "Hồ sơ hiện tại" : row.student}</p>
                  <p className="mt-2 text-3xl font-bold text-[#004ac6]">{row.average}</p>
                  <p className="mt-1 text-xs text-[#505f76]">Điểm trung bình học kỳ</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="space-y-6">
          <article className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#191b23]">Thông tin liên hệ</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <Info label="Phụ huynh" value={student.guardian} />
              <Info label="Điện thoại" value={student.phone} />
              <Info label="Trạng thái" value={student.status} />
              <Info label="Gói học phí" value={tuition.packageName} />
            </dl>
          </article>
          <article className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#191b23]">Chuyên cần gần đây</h2>
            <div className="mt-4 space-y-3">
              {attendanceMock.map((row) => (
                <div key={`${row.no}-${row.student}`} className="flex items-center justify-between rounded-lg bg-[#f8fafc] p-3 text-sm">
                  <span className="font-semibold text-[#191b23]">{row.student}</span>
                  <span className="font-bold text-[#166534]">{row.morning}</span>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </AdminShell>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <article className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm">
      <Icon name={icon} className="mb-4 text-[28px] text-[#004ac6]" />
      <p className="text-sm text-[#505f76]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#191b23]">{value}</p>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-[#505f76]">{label}</dt>
      <dd className="mt-1 font-semibold text-[#191b23]">{value}</dd>
    </div>
  );
}
