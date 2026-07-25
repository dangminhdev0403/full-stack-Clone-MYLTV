import { PlannedSurface } from "@/features/planned/components/planned-surface";

export default function UniformsAdminPage() {
  return (
    <PlannedSurface
      title="Đồng phục"
      activeHref="/admin/services/uniforms"
      description="Quản lý sản phẩm đồng phục, tồn kho và xử lý đơn hàng của học sinh đang được giữ planned cho đến khi admin API contract hoàn tất."
    />
  );
}
