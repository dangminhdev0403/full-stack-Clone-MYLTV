import { gradebookMock } from "../data/admin-pages.mock";
import { AdminShell, Icon } from "./admin-shell";

export function AdminGradesPage() {
  return (
    <AdminShell
      activeHref="/admin/grades"
      title="Sổ điểm điện tử"
      subtitle="Nhập điểm, rà soát tiến độ và khóa bảng điểm học kỳ theo cấu trúc gradebook của Stitch EduManager."
    >
      <section className="grid gap-5 md:grid-cols-4">
        <GradeStat label="Bài đã nhập" value="328" />
        <GradeStat label="Chờ nhập" value="42" />
        <GradeStat label="Cần rà soát" value="11" />
        <GradeStat label="Lớp đã khóa" value="8" />
      </section>

      <section className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <select aria-label="Chọn lớp" className="h-10 rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#b4c5ff]"><option>7A0</option><option>7A1</option><option>8B1</option></select>
          <select aria-label="Môn học" className="h-10 rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#b4c5ff]"><option>Toán</option><option>Tiếng Anh</option><option>Vật lý</option></select>
          <select aria-label="Học kỳ" className="h-10 rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#b4c5ff]"><option>Học kỳ I</option><option>Học kỳ II</option></select>
          <button className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#c3c6d7] bg-[#ededf9] px-4 text-sm font-bold text-[#191b23] transition hover:bg-[#e1e2ed] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]"><Icon name="upload_file" className="text-[18px]" />Nhập bảng</button>
          <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-4 text-sm font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]"><Icon name="lock" className="text-[18px]" />Khóa điểm</button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead className="bg-[#f8fafc] text-xs font-bold uppercase tracking-wide text-[#505f76]">
              <tr>
                <th className="px-5 py-4">No.</th>
                <th className="px-5 py-4">Học sinh</th>
                <th className="px-5 py-4">Lớp</th>
                <th className="border-l border-[#e1e2ed] px-5 py-4 text-center">Miệng</th>
                <th className="px-5 py-4 text-center">15 phút</th>
                <th className="px-5 py-4 text-center">Giữa kỳ</th>
                <th className="px-5 py-4 text-center">Cuối kỳ</th>
                <th className="px-5 py-4 text-center">Trung bình</th>
                <th className="px-5 py-4 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e2ed]">
              {gradebookMock.map((row) => (
                <tr key={row.no} className="transition hover:bg-[#f3f3fe]">
                  <td className="px-5 py-4 text-sm text-[#505f76]">{row.no}</td>
                  <td className="px-5 py-4 font-bold text-[#191b23]">{row.student}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#191b23]">{row.className}</td>
                  <Score value={row.oral} />
                  <Score value={row.quiz} />
                  <Score value={row.midterm} />
                  <Score value={row.final} />
                  <td className="px-5 py-4 text-center text-lg font-bold text-[#004ac6]">{row.average}</td>
                  <td className="px-5 py-4 text-right"><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-[#166534]">Đã lưu</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}

function GradeStat({ label, value }: { label: string; value: string }) {
  return <article className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm"><p className="text-sm font-medium text-[#505f76]">{label}</p><p className="mt-1 text-3xl font-bold tracking-[-0.02em] text-[#191b23]">{value}</p></article>;
}

function Score({ value }: { value: string }) {
  return <td className="px-5 py-4 text-center"><input aria-label={`Điểm ${value}`} className="h-9 w-16 rounded-lg border border-[#c3c6d7] bg-white text-center text-sm font-bold text-[#191b23] outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#b4c5ff]" readOnly value={value} /></td>;
}
