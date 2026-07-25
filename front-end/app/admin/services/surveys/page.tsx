import { PlannedSurface } from "@/features/planned/components/planned-surface";

export default function SurveysAdminPage() {
  return (
    <PlannedSurface
      title="Khảo sát"
      activeHref="/admin/services/surveys"
      description="Quản lý tạo phiếu khảo sát và tổng hợp phản hồi đang được giữ planned cho đến khi admin CRUD API contract hoàn tất."
    />
  );
}
