import Link from "next/link";
import { studentsMock } from "../data/admin-pages.mock";
import { AdminShell, Icon } from "./admin-shell";

export function AdminStudentsPage() {
  return (
    <AdminShell
      activeHref="/admin/students"
      title="Quản lý học sinh"
      subtitle="Danh sách học sinh được đồng bộ từ mẫu Stitch EduManager, dùng dữ liệu tĩnh trong giai đoạn chưa có backend."
    >
      <section className="grid gap-5 md:grid-cols-3">
        <SummaryCard icon="groups" label="Tổng học sinh" value="1.250" note="Theo năm học hiện tại" />
        <SummaryCard icon="person_alert" label="Cần theo dõi" value="18" note="Chuyên cần hoặc học lực giảm" />
        <SummaryCard icon="verified" label="Hồ sơ hoàn chỉnh" value="97%" note="Đã xác minh thông tin phụ huynh" />
      </section>

      <section className="rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#c3c6d7] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {['Tất cả khối', 'Lớp 7A0', 'Đang học', 'Cần theo dõi'].map((filter) => (
              <button key={filter} className="rounded-lg border border-[#c3c6d7] bg-[#f8fafc] px-3 py-2 text-sm font-semibold text-[#505f76] transition hover:bg-[#e1e2ed] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]">
                {filter}
              </button>
            ))}
          </div>
          <label className="min-w-0 lg:w-80">
            <span className="sr-only">Tìm kiếm học sinh</span>
            <input className="h-10 w-full rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm text-[#191b23] outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#b4c5ff]" placeholder="Tìm theo tên, mã học sinh" />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-[#f8fafc] text-xs font-bold uppercase tracking-wide text-[#505f76]">
              <tr>
                <th className="px-5 py-4">Học sinh</th>
                <th className="px-5 py-4">Lớp</th>
                <th className="px-5 py-4">Phụ huynh</th>
                <th className="px-5 py-4">Chuyên cần</th>
                <th className="px-5 py-4">Điểm TB</th>
                <th className="px-5 py-4">Công nợ</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e2ed]">
              {studentsMock.map((student) => (
                <tr key={student.id} className="transition hover:bg-[#f3f3fe]">
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#191b23]">{student.name}</p>
                    <p className="text-xs text-[#505f76]">{student.code}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#191b23]">{student.className}</td>
                  <td className="px-5 py-4 text-sm text-[#505f76]">
                    <p className="font-semibold text-[#191b23]">{student.guardian}</p>
                    <p>{student.phone}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#166534]">{student.attendance}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#004ac6]">{student.gpa}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#9a3412]">{student.balance}</td>
                  <td className="px-5 py-4"><StatusBadge status={student.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <Link className="inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-bold text-[#004ac6] hover:bg-[#dbe1ff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]" href={`/admin/students/${student.id}`}>
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}

function SummaryCard({ icon, label, value, note }: { icon: string; label: string; value: string; note: string }) {
  return (
    <article className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm">
      <div className="mb-4 grid size-10 place-items-center rounded-lg bg-[#dbe1ff] text-[#004ac6]"><Icon name={icon} /></div>
      <p className="text-sm font-medium text-[#505f76]">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-[-0.02em] text-[#191b23]">{value}</p>
      <p className="mt-1 text-xs text-[#737686]">{note}</p>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === "Cần theo dõi" ? "bg-[#ffdbcd] text-[#9a3412]" : status === "Bảo lưu hồ sơ" ? "bg-[#e1e2ed] text-[#505f76]" : "bg-green-50 text-[#166534]";
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{status}</span>;
}
