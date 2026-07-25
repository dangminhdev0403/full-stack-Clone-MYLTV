import { PlannedSurface } from "@/features/planned/components/planned-surface";

export default function ReportsAdminPage() {
  return (
    <PlannedSurface
      title="Báo cáo"
      activeHref="/admin/reports"
      description="Chức năng xuất báo cáo (Excel/PDF) và phân tích tổng hợp đang được thiết kế API contract cho phiên bản tiếp theo."
    />
  );
}
