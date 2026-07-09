import { Badge } from "@/components/shared/badge";
import { Panel } from "@/components/shared/panel";
import { teacherCapacity } from "../data/teacher-capacity.mock";
import type { TeacherLoadState } from "../types/teacher.types";

const stateStyles: Record<TeacherLoadState, string> = {
  "Quá tải": "bg-red-50 text-red-800 ring-red-700/20",
  "Ổn định": "bg-emerald-50 text-emerald-800 ring-emerald-700/20",
  "Cần hỗ trợ": "bg-amber-50 text-amber-900 ring-amber-700/20",
};

export function TeacherCapacityPanel() {
  return (
    <Panel id="teachers" title="Tải giáo viên" action="Cân bằng lại">
      <div className="divide-y divide-slate-200">
        {teacherCapacity.map((item) => (
          <div key={item.label} className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_86px_110px] sm:items-center">
            <div>
              <p className="font-black text-slate-950">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">{item.owner}</p>
            </div>
            <p className="font-mono text-lg font-black tabular-nums text-slate-950">{item.load}%</p>
            <Badge className={stateStyles[item.state]}>{item.state}</Badge>
          </div>
        ))}
      </div>
    </Panel>
  );
}
