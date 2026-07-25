import { PlannedSurface } from "@/features/planned/components/planned-surface";

export default function ClubsAdminPage() {
  return (
    <PlannedSurface
      title="Câu lạc bộ"
      activeHref="/admin/services/clubs"
      description="Quản lý danh sách CLB, phụ trách và duyệt học sinh đăng ký đang được giữ planned cho đến khi admin API contract hoàn tất."
    />
  );
}
