import { PlannedSurface } from "@/features/planned/components/planned-surface";

export default function MealsAdminPage() {
  return (
    <PlannedSurface
      title="Bữa ăn"
      activeHref="/admin/services/meals"
      description="Quản trị thực đơn bán trú và thống kê suất ăn đang được giữ planned cho đến khi admin CRUD API contract hoàn tất."
    />
  );
}
