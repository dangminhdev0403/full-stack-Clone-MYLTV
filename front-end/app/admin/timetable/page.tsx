import { PlannedSurface } from "@/features/planned/components/planned-surface";

export default function Page() {
  return (
    <PlannedSurface
      title="Thời khóa biểu"
      activeHref="/admin/timetable"
      description="Blocked: backend hiện chỉ có mutation admin; list/detail vẫn là endpoint app theo học sinh, chưa có admin filter theo lớp, khối và học kỳ."
    />
  );
}
