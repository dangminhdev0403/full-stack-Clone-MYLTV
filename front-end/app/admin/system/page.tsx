import { PlannedSurface } from "@/features/planned/components/planned-surface";

export default function SystemAdminPage() {
  return (
    <PlannedSurface
      title="Hệ thống"
      activeHref="/admin/system"
      description="Module cấu hình hệ thống và quản lý Audit Log chi tiết đang được giữ planned cho đến khi API contract được phê duyệt."
    />
  );
}
