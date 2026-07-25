import { PlannedSurface } from "@/features/planned/components/planned-surface";

export default function BusAdminPage() {
  return (
    <PlannedSurface
      title="Xe buýt"
      activeHref="/admin/services/bus"
      description="Quản lý lộ trình xe buýt, tài xế và giám sát tọa độ GPS xe đưa đón đang được giữ planned cho đến khi admin API contract hoàn tất."
    />
  );
}
