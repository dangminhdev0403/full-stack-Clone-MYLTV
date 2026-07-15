import { AdminShell } from "@/features/admin-shell";

export function PlannedSurface({ title, activeHref }: { title: string; activeHref: string }) {
  return <AdminShell activeHref={activeHref} title={title} subtitle="Bề mặt đã được quy hoạch; backend chưa triển khai trong phạm vi hiện tại."><section className="rounded-xl border border-amber-300 bg-amber-50 p-6"><p className="font-bold text-amber-900">Backend chưa triển khai</p><p className="mt-2 text-amber-800">Màn hình này không gửi API giả và sẽ được kết nối khi bounded context tương ứng có contract implemented.</p></section></AdminShell>;
}
