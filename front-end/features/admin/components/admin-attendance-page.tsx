import { attendanceMock } from "../data/admin-pages.mock";
import { AdminShell, Icon } from "./admin-shell";

export function AdminAttendancePage() {
  return (
    <AdminShell
      activeHref="/admin/attendance"
      title="Quản lý chuyên cần"
      subtitle="Theo dõi và ghi nhận tình trạng đi học của học sinh theo ngày, theo lớp và theo từng buổi."
    >
      <section className="grid gap-5 md:grid-cols-4">
        <AttendanceStat label="Có mặt" value="1.182" tone="text-[#166534]" />
        <AttendanceStat label="Đi muộn" value="24" tone="text-[#9a3412]" />
        <AttendanceStat label="Nghỉ phép" value="18" tone="text-[#004ac6]" />
        <AttendanceStat label="Chưa xác nhận" value="6" tone="text-[#ba1a1a]" />
      </section>

      <section className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <select aria-label="Chọn lớp" className="h-10 rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#b4c5ff]">
            <option>Tất cả lớp</option>
            <option>7A0</option>
            <option>7A1</option>
            <option>8B1</option>
          </select>
          <input aria-label="Ngày điểm danh" className="h-10 rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#b4c5ff]" readOnly value="08/07/2026" />
          <select aria-label="Buổi học" className="h-10 rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#b4c5ff]">
            <option>Cả ngày</option>
            <option>Buổi sáng</option>
            <option>Buổi chiều</option>
          </select>
          <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-4 text-sm font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff] active:scale-[0.98]">
            <Icon name="checklist" className="text-[18px]" />
            Khóa sổ ngày
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead className="bg-[#f8fafc] text-xs font-bold uppercase tracking-wide text-[#505f76]">
              <tr>
                <th className="px-5 py-4">No.</th>
                <th className="px-5 py-4">Học sinh</th>
                <th className="px-5 py-4">Lớp</th>
                <th className="px-5 py-4">Buổi sáng</th>
                <th className="px-5 py-4">Buổi chiều</th>
                <th className="px-5 py-4">Ghi chú</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e2ed]">
              {attendanceMock.map((row) => (
                <tr key={row.no} className="transition hover:bg-[#f3f3fe]">
                  <td className="px-5 py-4 text-sm text-[#505f76]">{row.no}</td>
                  <td className="px-5 py-4 font-bold text-[#191b23]">{row.student}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#191b23]">{row.className}</td>
                  <td className="px-5 py-4"><AttendancePill value={row.morning} /></td>
                  <td className="px-5 py-4"><AttendancePill value={row.afternoon} /></td>
                  <td className="px-5 py-4 text-sm text-[#505f76]">{row.note}</td>
                  <td className="px-5 py-4 text-right"><button className="rounded-lg px-3 py-2 text-sm font-bold text-[#004ac6] hover:bg-[#dbe1ff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]">Cập nhật</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}

function AttendanceStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <article className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-[#505f76]">{label}</p>
      <p className={`mt-1 text-3xl font-bold tracking-[-0.02em] ${tone}`}>{value}</p>
    </article>
  );
}

function AttendancePill({ value }: { value: string }) {
  const tone = value === "Có mặt" ? "bg-green-50 text-[#166534]" : value === "Đi muộn" ? "bg-[#ffdbcd] text-[#9a3412]" : "bg-[#dbe1ff] text-[#004ac6]";
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{value}</span>;
}
