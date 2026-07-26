import { PlannedSurface } from "@/features/planned/components/planned-surface";

export default function Page() {
  return (
    <PlannedSurface
      title="Điểm số"
      activeHref="/admin/grades"
      description="Blocked: backend hiện chỉ có mutation admin; list/detail vẫn là endpoint app theo học sinh, chưa có admin filter theo lớp, môn và học kỳ."
    />
  );
}
