import { tuitionMock } from "../data/admin-pages.mock";
import { AdminShell, Icon } from "../../admin-shell";

export function AdminTuitionPage() {
  return (
    <AdminShell
      activeHref="/admin/tuition"
      title="Học phí & Thanh toán"
      subtitle="Theo dõi thu học phí, công nợ và lịch nhắc phụ huynh theo mẫu quản trị tài chính EduManager."
    >
      <section className="grid gap-5 md:grid-cols-4">
        <MoneyCard label="Đã thu" value="3.612.500.000đ" icon="account_balance_wallet" />
        <MoneyCard label="Còn phải thu" value="128.600.000đ" icon="pending_actions" />
        <MoneyCard label="Giao dịch hôm nay" value="84" icon="receipt_long" />
        <MoneyCard label="Hồ sơ cần nhắc" value="42" icon="notifications_active" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#c3c6d7] p-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-[#191b23]">Danh sách thanh toán</h2>
            <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-4 text-sm font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]">
              <Icon name="send" className="text-[18px]" />
              Gửi nhắc phí
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead className="bg-[#f8fafc] text-xs font-bold uppercase tracking-wide text-[#505f76]">
                <tr>
                  <th className="px-5 py-4">Học sinh</th>
                  <th className="px-5 py-4">Lớp</th>
                  <th className="px-5 py-4">Khoản thu</th>
                  <th className="px-5 py-4">Tổng tiền</th>
                  <th className="px-5 py-4">Đã thu</th>
                  <th className="px-5 py-4">Còn lại</th>
                  <th className="px-5 py-4">Hạn</th>
                  <th className="px-5 py-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e2ed]">
                {tuitionMock.map((row) => (
                  <tr key={`${row.student}-${row.packageName}`} className="transition hover:bg-[#f3f3fe]">
                    <td className="px-5 py-4 font-bold text-[#191b23]">{row.student}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#191b23]">{row.className}</td>
                    <td className="px-5 py-4 text-sm text-[#505f76]">{row.packageName}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#191b23]">{row.total}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#166534]">{row.paid}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#9a3412]">{row.remaining}</td>
                    <td className="px-5 py-4 text-sm text-[#505f76]">{row.dueDate}</td>
                    <td className="px-5 py-4 text-right"><TuitionStatus status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-6">
          <article className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#191b23]">Tỷ lệ thu theo khối</h2>
            <div className="mt-5 space-y-4">
              {[
                ["Khối 6", "92%"],
                ["Khối 7", "87%"],
                ["Khối 8", "94%"],
                ["Khối 9", "89%"],
              ].map(([grade, value]) => (
                <div key={grade}>
                  <div className="mb-1 flex justify-between text-sm font-semibold"><span>{grade}</span><span>{value}</span></div>
                  <div className="h-2 rounded-full bg-[#e1e2ed]"><div className="h-2 rounded-full bg-[#004ac6]" style={{ width: value }} /></div>
                </div>
              ))}
            </div>
          </article>
          <article className="rounded-xl border border-[#ffdbcd] bg-[#fff7ed] p-6 shadow-sm">
            <Icon name="warning" className="text-[28px] text-[#9a3412]" />
            <h2 className="mt-3 text-lg font-bold text-[#191b23]">42 hồ sơ đến hạn</h2>
            <p className="mt-2 text-sm leading-6 text-[#505f76]">Ưu tiên nhắc các khoản còn lại trong 7 ngày tới và ghi nhận phản hồi phụ huynh.</p>
          </article>
        </aside>
      </section>
    </AdminShell>
  );
}

function MoneyCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return <article className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm"><div className="mb-4 grid size-10 place-items-center rounded-lg bg-[#dbe1ff] text-[#004ac6]"><Icon name={icon} /></div><p className="text-sm font-medium text-[#505f76]">{label}</p><p className="mt-1 text-2xl font-bold tracking-[-0.02em] text-[#191b23]">{value}</p></article>;
}

function TuitionStatus({ status }: { status: string }) {
  const tone = status === "Đã thanh toán" ? "bg-green-50 text-[#166534]" : status === "Cần nhắc" ? "bg-[#ffdbcd] text-[#9a3412]" : "bg-[#dbe1ff] text-[#004ac6]";
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{status}</span>;
}
