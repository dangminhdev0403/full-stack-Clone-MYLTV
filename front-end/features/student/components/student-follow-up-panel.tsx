import { Panel } from "@/components/shared/panel";
import { studentFollowUps } from "../data/student-follow-up.mock";

export function StudentFollowUpPanel() {
  return (
    <Panel id="students" title="Theo dõi học viên" action="Giao phụ trách">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <caption className="sr-only">Danh sách học viên cần theo dõi theo tiến độ và chuyên cần</caption>
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-black text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-3">Học viên</th>
              <th scope="col" className="px-4 py-3">Nhóm lớp</th>
              <th scope="col" className="px-4 py-3">Tiến độ</th>
              <th scope="col" className="px-4 py-3">Chuyên cần</th>
              <th scope="col" className="px-4 py-3">Phụ trách</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {studentFollowUps.map((student) => (
              <tr key={student.student} className="hover:bg-slate-50/80">
                <th scope="row" className="px-4 py-3 font-black text-slate-950">{student.student}</th>
                <td className="px-4 py-3 font-semibold text-slate-700">{student.cohort}</td>
                <td className="px-4 py-3 font-mono font-black tabular-nums text-slate-950">{student.progress}</td>
                <td className="px-4 py-3 font-mono font-black tabular-nums text-slate-950">{student.attendance}</td>
                <td className="px-4 py-3 font-semibold text-slate-700">{student.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
