import { PlannedSurface } from "@/features/planned/components/planned-surface";

export default function Page() {
  return (
    <PlannedSurface
      title="Bài tập"
      activeHref="/admin/homeworks"
      description="Blocked: backend hiện chỉ có create admin; list/detail/update/delete và thống kê nộp bài vẫn thiếu contract quản trị."
    />
  );
}
